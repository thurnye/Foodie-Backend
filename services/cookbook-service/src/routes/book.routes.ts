import { Router } from 'express';
import BookController from '../controllers/BookController';

const router = Router();

/**
 * Book Routes
 */

// Create a new book
router.post('/', BookController.createBook.bind(BookController));

// Get user's books
router.get('/my', BookController.getMyBooks.bind(BookController));

// Get book for PDF rendering (unauthenticated endpoint for internal use)
// Must be before /:bookId to avoid route conflict
router.get('/:bookId/render-data', BookController.getBookForRendering.bind(BookController));

// Get book by ID
router.get('/:bookId', BookController.getBookById.bind(BookController));

// Update book
router.put('/:bookId', BookController.updateBook.bind(BookController));

// Delete book
router.delete('/:bookId', BookController.deleteBook.bind(BookController));

// Page Management Routes
// Add page to book
router.post('/:bookId/pages', BookController.addPage.bind(BookController));

// Reorder pages in book (must be before /:pageId routes to avoid route conflict)
router.put('/:bookId/pages/reorder', BookController.reorderPages.bind(BookController));

// Update page in book
router.put('/:bookId/pages/:pageId', BookController.updatePage.bind(BookController));

// Delete page from book
router.delete('/:bookId/pages/:pageId', BookController.deletePage.bind(BookController));

// Publish book
router.post('/:bookId/publish', BookController.publishBook.bind(BookController));

export default router;
