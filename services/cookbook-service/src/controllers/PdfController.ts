import { Request, Response } from 'express';
import { logger } from '@foodie/libs';
import PdfGenerationService from '../services/PdfGenerationService';

class PdfController {
  /**
   * Generate PDF for entire book
   * POST /api/cookbook/pdf/generate-book/:bookId
   */
  async generateBookPdf(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      logger.info('📚 PDF generation request received', { bookId, userId });

      // Generate PDF (also saves it and updates the book)
      const pdfBuffer = await PdfGenerationService.generateBookPdf(
        bookId,
        userId
      );

      // Get the updated book to retrieve the PDF URL
      const BookService = (await import('../services/BookService')).default;
      const book = await BookService.getBookById(bookId, userId);

      // Send success response with download URL instead of PDF buffer
      res.status(200).json({
        success: true,
        message: 'PDF generated successfully',
        data: {
          bookId: book._id,
          bookUrl: book.bookUrl,
          pdfSize: pdfBuffer.length,
        },
      });

      logger.info('✅ PDF generated and saved successfully', {
        bookId,
        bookUrl: book.bookUrl,
        size: pdfBuffer.length
      });

    } catch (error: any) {
      logger.error('❌ Error in generateBookPdf controller', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to generate PDF',
      });
    }
  }

  /**
   * Generate PDF for single page
   * POST /api/cookbook/pdf/generate-page/:bookId/:pageId
   */
  async generatePagePdf(req: Request, res: Response): Promise<void> {
    try {
      const { bookId, pageId } = req.params;
      const { pageType } = req.body;
      const userId = (req as any).user?.userId;

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

      logger.info('📄 Single page PDF generation request received', {
        bookId,
        pageId,
        pageType,
        userId,
      });

      // Generate PDF
      const pdfBuffer = await PdfGenerationService.generateSinglePagePdf(
        bookId,
        pageId,
        pageType,
        userId
      );

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="page-${pageId}.pdf"`
      );
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);

      logger.info('✅ Page PDF sent successfully', {
        bookId,
        pageId,
        size: pdfBuffer.length,
      });

    } catch (error: any) {
      logger.error('❌ Error in generatePagePdf controller', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to generate page PDF',
      });
    }
  }

  /**
   * Get PDF generation status
   * GET /api/cookbook/pdf/status/:bookId
   */
  async getPdfStatus(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
        return;
      }

      // For now, just return a simple status
      // In the future, this could track generation progress
      res.json({
        success: true,
        data: {
          bookId,
          status: 'ready',
          message: 'Book is ready for PDF generation',
        },
      });

    } catch (error: any) {
      logger.error('❌ Error in getPdfStatus controller', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to get PDF status',
      });
    }
  }
}

export default new PdfController();
