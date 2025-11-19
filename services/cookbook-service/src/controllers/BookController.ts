import { Request, Response } from 'express';
import { logger } from '@foodie/libs';
import BookService from '../services/BookService';

class BookController {
  /**
   * Create a new book or update existing book
   * POST /api/books
   */
  async createBook(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to create a book.',
        });
        return;
      }

      const { bookId, name, description, cookbookId, sections, recipeIds } = req.body;

      console.log('📥 CREATE/UPDATE BOOK REQUEST:', req.body);

      // Otherwise, create new book
      if (!cookbookId) {
        res.status(400).json({
          success: false,
          message: 'Cookbook ID is required to create a new book',
        });
        return;
      }

      console.log('📘 Creating new book for cookbook:', cookbookId);

      const book = await BookService.createBook(
        userId,
        {
          bookId,
          name,
          description,
          cookbookId,
          sections,
          recipeIds,
        }
      );

      const message = bookId
        ? 'Book updated successfully with new recipes'
        : 'Book created successfully';

      res.status(bookId ? 200 : 201).json({
        success: true,
        data: book,
        message,
      });
    } catch (error: any) {
      logger.error('Create/Update book error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to create/update book',
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
      const userId = (req as any).user?.userId;

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
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to view your books.',
        });
        return;
      }

      const { page, limit, status, isPublic, cookbookId } = req.query;

      const result = await BookService.getMyBooks(userId, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as any,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        cookbookId: cookbookId as string | undefined,
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
      const userId = (req as any).user?.userId;

      console.log('📥 UPDATE BOOK REQUEST:', {
        bookId,
        userId,
        updates: req.body,
      });

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to update this book.',
        });
        return;
      }

      const updates = req.body;

      const book = await BookService.updateBook(bookId, userId, updates);

      console.log('✅ BOOK UPDATED SUCCESSFULLY:', {
        bookId,
        updatedLayout: (book as any).layout,
      });

      res.status(200).json({
        success: true,
        data: book,
        message: 'Book updated successfully',
      });
    } catch (error: any) {
      console.error('❌ UPDATE BOOK ERROR:', error);
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
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to delete this book.',
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
   * Add page to book
   * POST /api/books/:bookId/pages
   */
  async addPage(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to add pages.',
        });
        return;
      }

      const pageData = req.body;

      if (!pageData.pageType || pageData.position === undefined) {
        res.status(400).json({
          success: false,
          message: 'Page type and position are required',
        });
        return;
      }

      const book = await BookService.addPage(bookId, userId, pageData);

      res.status(201).json({
        success: true,
        data: book,
        message: 'Page added successfully',
      });
    } catch (error: any) {
      logger.error('Add page error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to add page',
      });
    }
  }

  /**
   * Update page in book
   * PUT /api/books/:bookId/pages/:pageId
   */
  async updatePage(req: Request, res: Response): Promise<void> {
    try {
      const { bookId, pageId } = req.params;
      const userId = (req as any).user?.userId;

      console.log('📥 UPDATE PAGE REQUEST:', {
        bookId,
        pageId,
        userId,
        updates: req.body,
        layoutUpdate: req.body.layout,
        requestUrl: req.originalUrl,
        method: req.method,
      });

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to update pages.',
        });
        return;
      }

      const updates = req.body;

      const book = await BookService.updatePage(bookId, pageId, userId, updates);

      // Find updated page in the new schema (could be in recipe array, coverData, introData, or extraPageData array)
      const updatedRecipe = book.recipe?.find((r: any) => r.pageId === pageId);
      const updatedExtraPage = book.extraPageData?.find((p: any) => p.pageId === pageId);
      const updatedPage = updatedRecipe ||
        (book.coverData?.pageId === pageId ? book.coverData : null) ||
        (book.introData?.pageId === pageId ? book.introData : null) ||
        updatedExtraPage;

      console.log('✅ PAGE UPDATED SUCCESSFULLY:', {
        bookId,
        pageId,
        updatedLayout: updatedPage?.layout,
        pageExists: !!updatedPage,
        totalRecipes: book.recipe?.length || 0,
        allRecipeLayouts: book.recipe?.map((r: any) => ({ pageId: r.pageId, layout: r.layout })) || [],
      });

      res.status(200).json({
        success: true,
        data: book,
        message: 'Page updated successfully',
      });
    } catch (error: any) {
      console.error('❌ UPDATE PAGE ERROR:', error);
      logger.error('Update page error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update page',
      });
    }
  }

  /**
   * Delete page from book
   * DELETE /api/books/:bookId/pages/:pageId
   */
  async deletePage(req: Request, res: Response): Promise<void> {
    try {
      const { bookId, pageId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to delete pages.',
        });
        return;
      }

      const book = await BookService.deletePage(bookId, pageId, userId);

      res.status(200).json({
        success: true,
        data: book,
        message: 'Page deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete page error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete page',
      });
    }
  }

  /**
   * Reorder pages in book
   * PUT /api/books/:bookId/pages/reorder
   */
  async reorderPages(req: Request, res: Response): Promise<void> {
    try {
      const { bookId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to reorder pages.',
        });
        return;
      }

      const { pageOrder } = req.body;

      if (!Array.isArray(pageOrder)) {
        res.status(400).json({
          success: false,
          message: 'Page order must be an array of { pageId, position } objects',
        });
        return;
      }

      const book = await BookService.reorderPages(bookId, userId, pageOrder);

      res.status(200).json({
        success: true,
        data: book,
        message: 'Pages reordered successfully',
      });
    } catch (error: any) {
      logger.error('Reorder pages error', { error });
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to reorder pages',
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
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required. Please log in to publish this book.',
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
