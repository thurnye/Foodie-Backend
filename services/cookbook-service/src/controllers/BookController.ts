import { Request, Response } from 'express';
import { logger } from '@foodie/libs';
import BookService from '../services/BookService';

class BookController {
  /**
   * Create a new book
   * POST /api/books
   */
  async createBook(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const { cookbookId, title, description, sections } = req.body;

      if (!cookbookId || !title || !sections) {
        res.status(400).json({
          success: false,
          message: 'Cookbook ID, title, and sections are required',
        });
        return;
      }

      const book = await BookService.createBook(userId, {
        cookbookId,
        title,
        description,
        sections,
      });

      res.status(201).json({
        success: true,
        data: book,
        message: 'Book created successfully',
      });
    } catch (error: any) {
      logger.error('Create book error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create book',
      });
    }
  }

  /**
   * Get book by ID
   * GET /api/books/:bookId
   */
  async getBookById(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const userId = req.headers['x-user-id'] as string | undefined;

      const book = await BookService.getBookById(bookId, userId);

      res.status(200).json({
        success: true,
        data: book,
      });
    } catch (error: any) {
      logger.error('Get book error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to get book',
      });
    }
  }

  /**
   * Get user's books
   * GET /api/books/my
   */
  async getMyBooks(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const { page, limit, status, isPublic } = req.query;

      const result = await BookService.getMyBooks(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as any,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      });

      res.status(200).json({
        success: true,
        data: result.books,
        pagination: result.pagination,
      });
    } catch (error: any) {
      logger.error('Get my books error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to get books',
      });
    }
  }

  /**
   * Update book
   * PUT /api/books/:bookId
   */
  async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const updates = req.body;

      const book = await BookService.updateBook(bookId, userId, updates);

      res.status(200).json({
        success: true,
        data: book,
        message: 'Book updated successfully',
      });
    } catch (error: any) {
      logger.error('Update book error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update book',
      });
    }
  }

  /**
   * Delete book
   * DELETE /api/books/:bookId
   */
  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      await BookService.deleteBook(bookId, userId);

      res.status(200).json({
        success: true,
        message: 'Book deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete book error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete book',
      });
    }
  }

  /**
   * Publish book
   * POST /api/books/:bookId/publish
   */
  async publishBook(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const book = await BookService.publishBook(bookId, userId);

      res.status(200).json({
        success: true,
        data: book,
        message: 'Book published successfully',
      });
    } catch (error: any) {
      logger.error('Publish book error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to publish book',
      });
    }
  }
}

export default new BookController();
