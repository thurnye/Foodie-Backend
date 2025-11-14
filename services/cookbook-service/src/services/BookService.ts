import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import Book from '../db/Book';
import Cookbook from '../db/Cookbook';
import { IBook, IBookSection, BookStatus } from '../Types/book.types';

interface CreateBookData {
  cookbookId: string;
  layout?: string;
  sections?: IBookSection[];
}

interface UpdateBookData {
  layout?: string;
  sections?: IBookSection[];
  status?: BookStatus;
  isPublic?: boolean;
}

class BookService {
  /**
   * Create a new book from a recipe in the cookbook
   */
  async createBook(userId: string, data: CreateBookData, recipeData?: any): Promise<IBook> {
    try {
      // Verify cookbook exists and user has access
      const cookbook = await Cookbook.findOne({
        _id: data.cookbookId,
        isActive: true,
      });

      if (!cookbook) {
        throw Errors.notFound('Cookbook not found');
      }

      // Check if user is the cookbook author
      if (cookbook.author.toString() !== userId) {
        throw Errors.forbidden('You can only create books from your own cookbooks');
      }

      // Create book with optional embedded recipe data
      const bookData: any = {
        cookbook: new Types.ObjectId(data.cookbookId),
        layout: data.layout || cookbook.layout || 'single-column',
        sections: data.sections ? data.sections.map(section => ({
          ...section,
          lastEditedAt: new Date(),
        })) : [],
        status: BookStatus.DRAFT,
        isPublic: false,
      };

      // Add recipe data if provided
      if (recipeData) {
        bookData.recipe = {
          basicInfo: recipeData.basicInfo,
          details: recipeData.details,
          directions: recipeData.directions,
          author: recipeData.author,
        };
      }

      const book = new Book(bookData);
      await book.save();

      // Add book to cookbook's books array
      cookbook.books.push(book._id);
      await cookbook.save();

      logger.info('Book created', {
        bookId: book._id,
        userId,
        cookbookId: data.cookbookId,
        hasRecipe: !!recipeData
      });

      return book;
    } catch (error) {
      logger.error('Error creating book', { error, userId });
      throw error;
    }
  }

  /**
   * Get book by ID
   */
  async getBookById(bookId: string, userId?: string): Promise<IBook> {
    try {
      const book = await Book.findOne({
        _id: bookId,
        isActive: true,
      }).populate('cookbook');

      if (!book) {
        throw Errors.notFound('Book not found');
      }

      // Check permissions via the cookbook author
      const cookbook = book.cookbook as any;
      if (userId) {
        const isAuthor = cookbook.author?.toString() === userId;
        if (!isAuthor && !book.isPublic) {
          throw Errors.forbidden('You do not have permission to access this book');
        }
      } else if (!book.isPublic) {
        throw Errors.forbidden('This book is private');
      }

      return book;
    } catch (error) {
      logger.error('Error fetching book', { error, bookId });
      throw error;
    }
  }

  /**
   * Get user's books (via cookbook author)
   */
  async getMyBooks(userId: string, query: {
    page?: number;
    limit?: number;
    status?: BookStatus;
    isPublic?: boolean;
    cookbookId?: string;
  } = {}): Promise<{
    books: IBook[];
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
      totalBooks: number;
    };
  }> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      // First, get user's cookbooks
      const userCookbooks = await Cookbook.find({
        author: userId,
        isActive: true,
      }).select('_id');

      const cookbookIds = userCookbooks.map(cb => cb._id);

      // Build filter for books
      const filter: any = {
        cookbook: { $in: cookbookIds },
        isActive: true,
      };

      if (query.cookbookId) {
        filter.cookbook = query.cookbookId;
      }

      if (query.status) {
        filter.status = query.status;
      }

      if (query.isPublic !== undefined) {
        filter.isPublic = query.isPublic;
      }

      // Get total count
      const totalBooks = await Book.countDocuments(filter);

      // Get books
      const books = await Book.find(filter)
        .populate('cookbook')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        books,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(totalBooks / limit),
          totalBooks,
        },
      };
    } catch (error) {
      logger.error('Error fetching user books', { error, userId });
      throw error;
    }
  }

  /**
   * Update book
   */
  async updateBook(
    bookId: string,
    userId: string,
    updates: UpdateBookData
  ): Promise<IBook> {
    try {
      const book = await Book.findOne({
        _id: bookId,
        isActive: true,
      }).populate('cookbook');

      if (!book) {
        throw Errors.notFound('Book not found');
      }

      // Check if user is the cookbook author
      const cookbook = book.cookbook as any;
      if (cookbook.author.toString() !== userId) {
        throw Errors.forbidden('You can only update books from your own cookbooks');
      }

      // Update fields
      if (updates.layout !== undefined) book.layout = updates.layout;
      if (updates.status !== undefined) book.status = updates.status;
      if (updates.isPublic !== undefined) book.isPublic = updates.isPublic;

      if (updates.sections !== undefined) {
        // Update or add sections
        updates.sections.forEach(updatedSection => {
          const existingIndex = book.sections.findIndex(
            s => s.sectionId === updatedSection.sectionId
          );

          if (existingIndex !== -1) {
            // Update existing section
            book.sections[existingIndex] = {
              ...updatedSection,
              lastEditedAt: new Date(),
            };
          } else {
            // Add new section
            book.sections.push({
              ...updatedSection,
              lastEditedAt: new Date(),
            });
          }
        });
      }

      // Mark as published if status changed to published
      if (updates.status === BookStatus.PUBLISHED && !book.publishedAt) {
        book.publishedAt = new Date();
      }

      await book.save();

      logger.info('Book updated', { bookId, userId });

      return book;
    } catch (error) {
      logger.error('Error updating book', { error, bookId });
      throw error;
    }
  }

  /**
   * Delete book (soft delete)
   */
  async deleteBook(bookId: string, userId: string): Promise<void> {
    try {
      const book = await Book.findOne({
        _id: bookId,
        isActive: true,
      }).populate('cookbook');

      if (!book) {
        throw Errors.notFound('Book not found');
      }

      // Check if user is the cookbook author
      const cookbook = book.cookbook as any;
      if (cookbook.author.toString() !== userId) {
        throw Errors.forbidden('You can only delete books from your own cookbooks');
      }

      // Soft delete
      book.isActive = false;
      await book.save();

      // Remove book from cookbook's books array
      await Cookbook.updateOne(
        { _id: cookbook._id },
        { $pull: { books: book._id } }
      );

      logger.info('Book deleted', { bookId, userId });
    } catch (error) {
      logger.error('Error deleting book', { error, bookId });
      throw error;
    }
  }

  /**
   * Publish book
   */
  async publishBook(bookId: string, userId: string): Promise<IBook> {
    try {
      return await this.updateBook(bookId, userId, {
        status: BookStatus.PUBLISHED,
        isPublic: true,
      });
    } catch (error) {
      logger.error('Error publishing book', { error, bookId });
      throw error;
    }
  }
}

export default new BookService();
