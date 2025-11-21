import { Router } from 'express';
import BookController from '../controllers/BookController';

const router = Router();

/**
 * Book Routes
 */

// Create a new book
router.post('/', BookController.createBook);

// Get user's books
router.get('/my', BookController.getMyBooks);

// Get book for PDF rendering (unauthenticated endpoint for internal use)
// Must be before /:bookId to avoid route conflict
router.get('/:bookId/render-data', BookController.getBookForRendering);

// Get PDF generation status
router.get('/:bookId/generation-status', BookController.getGenerationStatus);

// Get book by ID
router.get('/:bookId', BookController.getBookById);

// Update book
router.put('/:bookId', BookController.updateBook);

// Delete book
router.delete('/:bookId', BookController.deleteBook);

// Page Management Routes
// Add page to book
router.post('/:bookId/pages', BookController.addPage);

// Reorder pages in book (must be before /:pageId routes to avoid route conflict)
router.put('/:bookId/pages/reorder', BookController.reorderPages);

// Update page in book
router.put('/:bookId/pages/:pageId', BookController.updatePage);

// Delete page from book
router.delete('/:bookId/pages/:pageId', BookController.deletePage);

// Publish book
router.post('/:bookId/publish', BookController.publishBook);

export default router;
