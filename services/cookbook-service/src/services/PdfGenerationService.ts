import { chromium, Browser } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { Errors, logger } from '@foodie/libs';
import bookService from './BookService';
import fileStorageService from './FileStorageService';

class PdfGenerationService {
  private frontendUrl: string;
  private browser: Browser | null = null;

  constructor() {
    // Get frontend URL from environment or use default
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  /**
   * Initialize browser instance
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      logger.info('🚀 Initializing Playwright browser...');
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      logger.info('✅ Browser initialized');
    }
    return this.browser;
  }

  /**
   * Close browser instance
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      logger.info('🔒 Closing browser...');
      await this.browser.close();
      this.browser = null;
      logger.info('✅ Browser closed');
    }
  }

  /**
   * Generate PDF for a specific page with fresh page instance
   */
  private async generatePagePdf(
    browser: Browser,
    bookId: string,
    pageId: string,
    pageType: string,
    paperSize: string = 'A4', // A3 or A4
    isLandscape: boolean = false
  ): Promise<Buffer> {
    // Create a fresh context and page for this render
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      const url = `${this.frontendUrl}/book-renderer?bookId=${bookId}&pageId=${pageId}&pageType=${pageType}`;

      logger.info(`📄 Rendering page: ${pageType} (${pageId})`, { url, paperSize, isLandscape });

      // Navigate to the renderer page
      await page.goto(url, { waitUntil: 'networkidle' });

      // Wait for the content to be fully rendered
      await page.waitForSelector('[data-pdf-ready="true"]', { timeout: 30000 });

      // Give it a bit more time for fonts and images to load
      await page.waitForTimeout(1000);

      // Define paper dimensions
      // A4: 210mm x 297mm, A3: 297mm x 420mm
      let width: string, height: string;

      if (paperSize === 'A3') {
        width = isLandscape ? '420mm' : '297mm';
        height = isLandscape ? '297mm' : '420mm';
      } else {
        // A4
        width = isLandscape ? '297mm' : '210mm';
        height = isLandscape ? '210mm' : '297mm';
      }

      // Generate PDF with custom dimensions
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

      logger.info(`✅ Page rendered successfully: ${pageType} (${pageId})`);

      return pdf;
    } catch (error: any) {
      logger.error(`❌ Error rendering page: ${pageType} (${pageId})`, {
        error: error.message || error,
        stack: error.stack,
        url: `${this.frontendUrl}/book-renderer?bookId=${bookId}&pageId=${pageId}&pageType=${pageType}`,
      });
      throw error;
    } finally {
      // Always close the page and context
      await page.close();
      await context.close();
    }
  }

  /**
   * Generate PDF for entire book
   */
  async generateBookPdf(
    bookId: string,
    userId: string
  ): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      logger.info('📚 Starting PDF generation for book', { bookId, userId });

      // Get book data
      const book = await bookService.getBookById(bookId, userId);

      if (!book) {
        throw Errors.notFound('Book not found');
      }

      // Initialize browser
      browser = await this.initBrowser();

      // Array to store all page PDFs
      const pagePdfs: Buffer[] = [];

      // 1. Generate Cover Page PDF (Portrait)
      if (book.coverData) {
        logger.info('📄 Generating cover page...');
        const paperSize = book.coverData.paperSize || 'A4';
        const coverPdf = await this.generatePagePdf(
          browser,
          bookId,
          book.coverData.pageId,
          'cover',
          paperSize,
          false // Portrait
        );
        pagePdfs.push(coverPdf);
      }

      // 2. Generate Intro Page PDF (Portrait)
      if (book.introData) {
        logger.info('📄 Generating intro page...');
        const paperSize = book.introData.paperSize || 'A4';
        const introPdf = await this.generatePagePdf(
          browser,
          bookId,
          book.introData.pageId,
          'intro',
          paperSize,
          false // Portrait
        );
        pagePdfs.push(introPdf);
      }

      // 3. Generate TOC Page PDF (Portrait)
      if (book.tocData) {
        logger.info('📄 Generating TOC page...');
        const paperSize = book.tocData.paperSize || 'A4';
        const tocPdf = await this.generatePagePdf(
          browser,
          bookId,
          book.tocData.pageId,
          'toc',
          paperSize,
          false // Portrait
        );
        pagePdfs.push(tocPdf);
      }

      // 4. Generate Front Extra Pages PDFs (Portrait)
      const frontExtraPages = book.extraPageData?.filter(
        (p: any) => p.section === 'front'
      ) || [];
      frontExtraPages.sort((a: any, b: any) => a.position - b.position);

      for (const extraPage of frontExtraPages) {
        logger.info(`📄 Generating front extra page: ${extraPage.title}...`);
        const paperSize = extraPage.paperSize || 'A4';
        const extraPdf = await this.generatePagePdf(
          browser,
          bookId,
          extraPage.pageId,
          'extra',
          paperSize,
          false // Portrait
        );
        pagePdfs.push(extraPdf);
      }

      // 5. Generate Recipe Pages PDFs (LANDSCAPE)
      if (book.recipe && book.recipe.length > 0) {
        const sortedRecipes = [...book.recipe].sort((a, b) => a.order - b.order);

        for (const recipe of sortedRecipes) {
          logger.info(`📄 Generating recipe page: ${recipe.basicInfo?.recipeName || 'Recipe'}...`);
          const paperSize = (recipe as any).paperSize || 'A3'; // Default to A3 for recipes
          const recipePdf = await this.generatePagePdf(
            browser,
            bookId,
            (recipe as any).pageId,
            'recipe',
            paperSize,
            true // LANDSCAPE for recipes
          );
          pagePdfs.push(recipePdf);
        }
      }

      // 6. Generate Back Extra Pages PDFs (Portrait)
      const backExtraPages = book.extraPageData?.filter(
        (p: any) => p.section === 'back'
      ) || [];
      backExtraPages.sort((a: any, b: any) => a.position - b.position);

      for (const extraPage of backExtraPages) {
        logger.info(`📄 Generating back extra page: ${extraPage.title}...`);
        const paperSize = extraPage.paperSize || 'A4';
        const extraPdf = await this.generatePagePdf(
          browser,
          bookId,
          extraPage.pageId,
          'extra',
          paperSize,
          false // Portrait
        );
        pagePdfs.push(extraPdf);
      }

      // 7. Generate Back Cover Page PDF (Portrait)
      if (book.backCoverData) {
        logger.info('📄 Generating back cover page...');
        const paperSize = book.backCoverData.paperSize || 'A4';
        const backCoverPdf = await this.generatePagePdf(
          browser,
          bookId,
          book.backCoverData.pageId,
          'back-cover',
          paperSize,
          false // Portrait
        );
        pagePdfs.push(backCoverPdf);
      }

      // Validate that we have pages to merge
      if (pagePdfs.length === 0) {
        throw Errors.badRequest('No pages to generate PDF from');
      }

      logger.info(`✅ PDF generation completed. Generated ${pagePdfs.length} pages`);

      // Merge all PDFs into one using pdf-lib
      logger.info('📦 Merging all page PDFs into one document...');
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < pagePdfs.length; i++) {
        try {
          const pdfBuffer = pagePdfs[i];
          const pdf = await PDFDocument.load(pdfBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

          copiedPages.forEach((page) => {
            mergedPdf.addPage(page);
          });

          logger.info(`✅ Merged page ${i + 1}/${pagePdfs.length}`);
        } catch (error) {
          logger.error(`❌ Error merging page ${i + 1}`, { error });
          throw Errors.internalServer(`Failed to merge page ${i + 1}`);
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const pdfBuffer = Buffer.from(mergedPdfBytes);
      logger.info(`✅ Successfully merged ${pagePdfs.length} pages into one PDF`);

      // Save PDF to file system
      logger.info('💾 Saving PDF to file system...');
      const bookUrl = await fileStorageService.savePdf(bookId, pdfBuffer);

      // Update book with PDF URL
      logger.info('📝 Updating book with PDF URL...');
      await bookService.updateBookUrl(bookId, bookUrl);

      logger.info('✅ PDF generation completed successfully', { bookUrl });

      return pdfBuffer;

    } catch (error: any) {
      logger.error('❌ Error generating PDF', {
        error: error.message || error,
        stack: error.stack,
        bookId
      });
      throw error;
    }
  }

  /**
   * Generate PDF for a single page
   */
  async generateSinglePagePdf(
    bookId: string,
    pageId: string,
    pageType: string,
    userId: string
  ): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      logger.info('📄 Generating single page PDF', { bookId, pageId, pageType, userId });

      // Verify user has access to the book
      const book = await bookService.getBookById(bookId, userId);

      if (!book) {
        throw Errors.notFound('Book not found');
      }

      // Initialize browser
      browser = await this.initBrowser();

      // Determine paper size and orientation for the page
      let paperSize = 'A4';
      let isLandscape = false;

      if (pageType === 'cover' && book.coverData?.paperSize) {
        paperSize = book.coverData.paperSize;
        isLandscape = false; // Portrait
      } else if (pageType === 'intro' && book.introData?.paperSize) {
        paperSize = book.introData.paperSize;
        isLandscape = false; // Portrait
      } else if (pageType === 'toc' && book.tocData?.paperSize) {
        paperSize = book.tocData.paperSize;
        isLandscape = false; // Portrait
      } else if (pageType === 'back-cover' && book.backCoverData?.paperSize) {
        paperSize = book.backCoverData.paperSize;
        isLandscape = false; // Portrait
      } else if (pageType === 'recipe') {
        const recipe = book.recipe?.find((r: any) => r.pageId === pageId);
        paperSize = (recipe as any)?.paperSize || 'A3';
        isLandscape = true; // LANDSCAPE for recipes
      } else if (pageType === 'extra') {
        const extraPage = book.extraPageData?.find((p: any) => p.pageId === pageId);
        paperSize = extraPage?.paperSize || 'A4';
        isLandscape = false; // Portrait
      }

      // Generate PDF for the specific page
      const pdf = await this.generatePagePdf(browser, bookId, pageId, pageType, paperSize, isLandscape);

      logger.info('✅ Single page PDF generated successfully');

      return pdf;

    } catch (error: any) {
      logger.error('❌ Error generating single page PDF', {
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

export default new PdfGenerationService();
