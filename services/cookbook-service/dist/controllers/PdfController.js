"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("@foodie/libs");
const PdfGenerationService_1 = __importDefault(require("../services/PdfGenerationService"));
class PdfController {
    async generateBookPdf(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            libs_1.logger.info('📚 PDF generation request received', { bookId, userId });
            const pdfBuffer = await PdfGenerationService_1.default.generateBookPdf(bookId, userId);
            const BookService = (await Promise.resolve().then(() => __importStar(require('../services/BookService')))).default;
            const book = await BookService.getBookById(bookId, userId);
            res.status(200).json({
                success: true,
                message: 'PDF generated successfully',
                data: {
                    bookId: book._id,
                    bookUrl: book.bookUrl,
                    pdfSize: pdfBuffer.length,
                },
            });
            libs_1.logger.info('✅ PDF generated and saved successfully', {
                bookId,
                bookUrl: book.bookUrl,
                size: pdfBuffer.length
            });
        }
        catch (error) {
            libs_1.logger.error('❌ Error in generateBookPdf controller', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to generate PDF',
            });
        }
    }
    async generatePagePdf(req, res) {
        try {
            const { bookId, pageId } = req.params;
            const { pageType } = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            if (!pageType) {
                res.status(400).json({
                    success: false,
                    message: 'pageType is required',
                });
                return;
            }
            libs_1.logger.info('📄 Single page PDF generation request received', {
                bookId,
                pageId,
                pageType,
                userId,
            });
            const pdfBuffer = await PdfGenerationService_1.default.generateSinglePagePdf(bookId, pageId, pageType, userId);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="page-${pageId}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.send(pdfBuffer);
            libs_1.logger.info('✅ Page PDF sent successfully', {
                bookId,
                pageId,
                size: pdfBuffer.length,
            });
        }
        catch (error) {
            libs_1.logger.error('❌ Error in generatePagePdf controller', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to generate page PDF',
            });
        }
    }
    async getPdfStatus(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    bookId,
                    status: 'ready',
                    message: 'Book is ready for PDF generation',
                },
            });
        }
        catch (error) {
            libs_1.logger.error('❌ Error in getPdfStatus controller', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get PDF status',
            });
        }
    }
}
exports.default = new PdfController();
//# sourceMappingURL=PdfController.js.map