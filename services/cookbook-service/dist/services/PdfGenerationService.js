"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = require("playwright");
const pdf_lib_1 = require("pdf-lib");
const libs_1 = require("@foodie/libs");
const BookService_1 = __importDefault(require("./BookService"));
const FileStorageService_1 = __importDefault(require("./FileStorageService"));
class PdfGenerationService {
    frontendUrl;
    browser = null;
    constructor() {
        this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    }
    async initBrowser() {
        if (!this.browser) {
            libs_1.logger.info('🚀 Initializing Playwright browser...');
            this.browser = await playwright_1.chromium.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            libs_1.logger.info('✅ Browser initialized');
        }
        return this.browser;
    }
    async closeBrowser() {
        if (this.browser) {
            libs_1.logger.info('🔒 Closing browser...');
            await this.browser.close();
            this.browser = null;
            libs_1.logger.info('✅ Browser closed');
        }
    }
    async generatePagePdf(browser, bookId, pageId, pageType, paperSize = 'A4', isLandscape = false) {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            const url = `${this.frontendUrl}/book-renderer?bookId=${bookId}&pageId=${pageId}&pageType=${pageType}`;
            libs_1.logger.info(`📄 Rendering page: ${pageType} (${pageId})`, { url, paperSize, isLandscape });
            await page.goto(url, { waitUntil: 'networkidle' });
            await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 30000 });
            await page.waitForTimeout(1000);
            let width, height;
            if (paperSize === 'A3') {
                width = isLandscape ? '420mm' : '297mm';
                height = isLandscape ? '297mm' : '420mm';
            }
            else {
                width = isLandscape ? '297mm' : '210mm';
                height = isLandscape ? '210mm' : '297mm';
            }
            const pdf = await page.pdf({
                width,
                height,
                printBackground: true,
                margin: {
                    top: '0',
                    right: '0',
                    bottom: '0',
                    left: '0',
                },
            });
            libs_1.logger.info(`✅ Page rendered successfully: ${pageType} (${pageId})`);
            return pdf;
        }
        catch (error) {
            libs_1.logger.error(`❌ Error rendering page: ${pageType} (${pageId})`, {
                error: error.message || error,
                stack: error.stack,
                url: `${this.frontendUrl}/book-renderer?bookId=${bookId}&pageId=${pageId}&pageType=${pageType}`,
            });
            throw error;
        }
        finally {
            await page.close();
            await context.close();
        }
    }
    async generateBookPdf(bookId, userId) {
        let browser = null;
        try {
            libs_1.logger.info('📚 Starting PDF generation for book', { bookId, userId });
            const book = await BookService_1.default.getBookById(bookId, userId);
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            browser = await this.initBrowser();
            const pagePdfs = [];
            if (book.coverData) {
                libs_1.logger.info('📄 Generating cover page...');
                const paperSize = book.coverData.paperSize || 'A4';
                const coverPdf = await this.generatePagePdf(browser, bookId, book.coverData.pageId, 'cover', paperSize, false);
                pagePdfs.push(coverPdf);
            }
            if (book.introData) {
                libs_1.logger.info('📄 Generating intro page...');
                const paperSize = book.introData.paperSize || 'A4';
                const introPdf = await this.generatePagePdf(browser, bookId, book.introData.pageId, 'intro', paperSize, paperSize === 'A3');
                pagePdfs.push(introPdf);
            }
            if (book.tocData) {
                libs_1.logger.info('📄 Generating TOC page...');
                const paperSize = book.tocData.paperSize || 'A4';
                const tocPdf = await this.generatePagePdf(browser, bookId, book.tocData.pageId, 'toc', paperSize, paperSize === 'A3');
                pagePdfs.push(tocPdf);
            }
            const frontExtraPages = book.extraPageData?.filter((p) => p.section === 'front') || [];
            frontExtraPages.sort((a, b) => a.position - b.position);
            for (const extraPage of frontExtraPages) {
                libs_1.logger.info(`📄 Generating front extra page: ${extraPage.title}...`);
                const paperSize = extraPage.paperSize || 'A4';
                const extraPdf = await this.generatePagePdf(browser, bookId, extraPage.pageId, 'extra', paperSize, paperSize === 'A3');
                pagePdfs.push(extraPdf);
            }
            if (book.recipe && book.recipe.length > 0) {
                const sortedRecipes = [...book.recipe].sort((a, b) => a.order - b.order);
                for (const recipe of sortedRecipes) {
                    libs_1.logger.info(`📄 Generating recipe page: ${recipe.basicInfo?.recipeName || 'Recipe'}...`);
                    const paperSize = recipe.paperSize || 'A3';
                    const recipePdf = await this.generatePagePdf(browser, bookId, recipe.pageId, 'recipe', paperSize, true);
                    pagePdfs.push(recipePdf);
                }
            }
            const backExtraPages = book.extraPageData?.filter((p) => p.section === 'back') || [];
            backExtraPages.sort((a, b) => a.position - b.position);
            for (const extraPage of backExtraPages) {
                libs_1.logger.info(`📄 Generating back extra page: ${extraPage.title}...`);
                const paperSize = extraPage.paperSize || 'A4';
                const extraPdf = await this.generatePagePdf(browser, bookId, extraPage.pageId, 'extra', paperSize, paperSize === 'A3');
                pagePdfs.push(extraPdf);
            }
            if (book.backCoverData) {
                libs_1.logger.info('📄 Generating back cover page...');
                const paperSize = book.backCoverData.paperSize || 'A4';
                const backCoverPdf = await this.generatePagePdf(browser, bookId, book.backCoverData.pageId, 'back-cover', paperSize, false);
                pagePdfs.push(backCoverPdf);
            }
            if (pagePdfs.length === 0) {
                throw libs_1.Errors.badRequest('No pages to generate PDF from');
            }
            libs_1.logger.info(`✅ PDF generation completed. Generated ${pagePdfs.length} pages`);
            libs_1.logger.info('📦 Merging all page PDFs into one document...');
            const mergedPdf = await pdf_lib_1.PDFDocument.create();
            for (let i = 0; i < pagePdfs.length; i++) {
                try {
                    const pdfBuffer = pagePdfs[i];
                    const pdf = await pdf_lib_1.PDFDocument.load(pdfBuffer);
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach((page) => {
                        mergedPdf.addPage(page);
                    });
                    libs_1.logger.info(`✅ Merged page ${i + 1}/${pagePdfs.length}`);
                }
                catch (error) {
                    libs_1.logger.error(`❌ Error merging page ${i + 1}`, { error });
                    throw libs_1.Errors.internalServer(`Failed to merge page ${i + 1}`);
                }
            }
            const mergedPdfBytes = await mergedPdf.save();
            const pdfBuffer = Buffer.from(mergedPdfBytes);
            libs_1.logger.info(`✅ Successfully merged ${pagePdfs.length} pages into one PDF`);
            libs_1.logger.info('💾 Saving PDF to file system...');
            const bookUrl = await FileStorageService_1.default.savePdf(bookId, pdfBuffer);
            libs_1.logger.info('📝 Updating book with PDF URL...');
            await BookService_1.default.updateBookUrl(bookId, bookUrl);
            libs_1.logger.info('✅ PDF generation completed successfully', { bookUrl });
            return pdfBuffer;
        }
        catch (error) {
            libs_1.logger.error('❌ Error generating PDF', {
                error: error.message || error,
                stack: error.stack,
                bookId
            });
            throw error;
        }
    }
    async generateSinglePagePdf(bookId, pageId, pageType, userId) {
        let browser = null;
        try {
            libs_1.logger.info('📄 Generating single page PDF', { bookId, pageId, pageType, userId });
            const book = await BookService_1.default.getBookById(bookId, userId);
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            browser = await this.initBrowser();
            let paperSize = 'A4';
            let isLandscape = false;
            if (pageType === 'cover' && book.coverData?.paperSize) {
                paperSize = book.coverData.paperSize;
                isLandscape = false;
            }
            else if (pageType === 'intro' && book.introData?.paperSize) {
                paperSize = book.introData.paperSize;
                isLandscape = false;
            }
            else if (pageType === 'toc' && book.tocData?.paperSize) {
                paperSize = book.tocData.paperSize;
                isLandscape = false;
            }
            else if (pageType === 'back-cover' && book.backCoverData?.paperSize) {
                paperSize = book.backCoverData.paperSize;
                isLandscape = false;
            }
            else if (pageType === 'recipe') {
                const recipe = book.recipe?.find((r) => r.pageId === pageId);
                paperSize = recipe?.paperSize || 'A3';
                isLandscape = true;
            }
            else if (pageType === 'extra') {
                const extraPage = book.extraPageData?.find((p) => p.pageId === pageId);
                paperSize = extraPage?.paperSize || 'A4';
                isLandscape = false;
            }
            const pdf = await this.generatePagePdf(browser, bookId, pageId, pageType, paperSize, isLandscape);
            libs_1.logger.info('✅ Single page PDF generated successfully');
            return pdf;
        }
        catch (error) {
            libs_1.logger.error('❌ Error generating single page PDF', {
                error: error.message || error,
                stack: error.stack,
                bookId,
                pageId,
                pageType
            });
            throw error;
        }
    }
}
exports.default = new PdfGenerationService();
//# sourceMappingURL=PdfGenerationService.js.map