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

// Get book by ID
router.get('/:bookId', BookController.getBookById.bind(BookController));

// Update book
router.put('/:bookId', BookController.updateBook.bind(BookController));

// Delete book
router.delete('/:bookId', BookController.deleteBook.bind(BookController));

// Publish book
router.post('/:bookId/publish', BookController.publishBook.bind(BookController));

export default router;
