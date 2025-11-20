import { Router } from 'express';
import PdfController from '../controllers/PdfController';

const router = Router();

/**
 * PDF Generation Routes
 * Base path: /api/cookbook/pdf
 */

/**
 * @route   POST /api/cookbook/pdf/generate-book/:bookId
 * @desc    Generate PDF for entire book
 * @access  Private (requires authentication)
 * @body    { format?: 'A4' | 'Letter', orientation?: 'portrait' | 'landscape', margin?: { top, right, bottom, left } }
 */
router.post('/generate-book/:bookId', PdfController.generateBookPdf);

/**
 * @route   POST /api/cookbook/pdf/generate-page/:bookId/:pageId
 * @desc    Generate PDF for single page
 * @access  Private (requires authentication)
 * @body    { pageType: string, format?: 'A4' | 'Letter', orientation?: 'portrait' | 'landscape', margin?: { top, right, bottom, left } }
 */
router.post('/generate-page/:bookId/:pageId', PdfController.generatePagePdf);

/**
 * @route   GET /api/cookbook/pdf/status/:bookId
 * @desc    Get PDF generation status for a book
 * @access  Private (requires authentication)
 */
router.get('/status/:bookId', PdfController.getPdfStatus);

export default router;
