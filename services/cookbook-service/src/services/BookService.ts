import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import Book from '../db/Book';
import Cookbook from '../db/Cookbook';
import { IBook, IBookSection, BookStatus } from '../Types/book.types';

interface CreateBookData {
  cookbookId: string;
  title: string;
  description?: string;
  sections: IBookSection[];
}

interface UpdateBookData {
  title?: string;
  description?: string;
  sections?: IBookSection[];
  status?: BookStatus;
  isPublic?: boolean;
}

class BookService {
  /**
   * Create a new book from edited cookbook content
   */
  async createBook(userId: string, data: CreateBookData): Promise<IBook> {
    try {
      // Verify cookbook exists and user has access
      const cookbook = await Cookbook.findOne({
        _id: data.cookbookId,
        isActive: true,
      });

      if (!cookbook) {
        throw Errors.notFound('Cookbook not found');
      }

      // Check if user is the author
      if (cookbook.author.toString() !== userId) {
        throw Errors.forbidden('You can only create books from your own cookbooks');
      }

      // Create book
      const book = new Book({
        cookbook: new Types.ObjectId(data.cookbookId),
        author: new Types.ObjectId(userId),
        title: data.title,
        description: data.description,
        sections: data.sections.map(section => ({
          ...section,
          lastEditedAt: new Date(),
        })),
        status: BookStatus.DRAFT,
        isPublic: false,
      });

      await book.save();

      logger.info('Book created', { bookId: book._id, userId, cookbookId: data.cookbookId });

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

      // Check permissions: must be author or book must be public
      if (userId) {
        const isAuthor = book.author.toString() === userId;
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
   * Get user's books
   */
  async getMyBooks(userId: string, query: {
    page?: number;
    limit?: number;
    status?: BookStatus;
    isPublic?: boolean;
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

      // Build filter
      const filter: any = {
        author: userId,
        isActive: true,
      };

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
      });

      if (!book) {
        throw Errors.notFound('Book not found');
      }

      // Check if user is the author
      if (book.author.toString() !== userId) {
        throw Errors.forbidden('You can only update your own books');
      }

      // Update fields
      if (updates.title !== undefined) book.title = updates.title;
      if (updates.description !== undefined) book.description = updates.description;
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
      });

      if (!book) {
        throw Errors.notFound('Book not found');
      }

      // Check if user is the author
      if (book.author.toString() !== userId) {
        throw Errors.forbidden('You can only delete your own books');
      }

      // Soft delete
      book.isActive = false;
      await book.save();

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
