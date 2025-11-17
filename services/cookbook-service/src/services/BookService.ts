import { fetchRecipeData } from './../utils/recipeClient';
import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import Book from '../db/Book';
import Cookbook from '../db/Cookbook';
import {
  IBook,
  IBookSection,
  BookStatus,
  IPage,
  PageType,
  ICoverPageData,
  IIntroPageData,
  IExtraPageData,
} from '../Types/book.types';

interface CreateBookData {
  bookId?: string;
  name?: string;
  description?: string;
  cookbookId: string;
  pages?: IPage[];
  sections?: IBookSection[];
  recipeIds?: string[]; // Recipe IDs to fetch and add as pages
}

interface UpdateBookData {
  name?: string;
  description?: string;
  pages?: IPage[];
  sections?: IBookSection[];
  status?: BookStatus;
  isPublic?: boolean;
  layout?: string; // For backward compatibility with old schema
}

interface CreatePageData {
  pageType: PageType;
  position: number;
  coverData?: ICoverPageData;
  introData?: IIntroPageData;
  recipe?: any;
  extraPageData?: IExtraPageData;
  layout?: string;
}

interface UpdatePageData {
  position?: number;
  coverData?: ICoverPageData;
  introData?: IIntroPageData;
  recipe?: any;
  extraPageData?: IExtraPageData;
  layout?: string;
  editedContent?: string;
}

class BookService {
  /**
   * Create a new book for a cookbook
   */
  async createBook(userId: string, data: CreateBookData): Promise<IBook> {
    try {
      console.log('📥 BookService.createBook called with:', {
        bookId: data.bookId,
        cookbookId: data.cookbookId,
        recipeCount: data.recipeIds?.length
      });

      // Check if we're updating an existing book
      let currentBook = null;
      if (data.bookId) {
        currentBook = await Book.findOne({
          _id: data.bookId,
          isActive: true,
        });

        console.log('🔍 Found existing book:', currentBook ? 'YES' : 'NO');

        // Verify the book belongs to the specified cookbook
        if (currentBook && currentBook.cookbook.toString() !== data.cookbookId) {
          throw Errors.badRequest('Book does not belong to the specified cookbook');
        }
      }

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
        throw Errors.forbidden(
          'You can only create books from your own cookbooks'
        );
      }

      // Initialize default pages if not provided
      const defaultPages: IPage[] = [
        {
          pageId: 'cover',
          pageType: PageType.COVER,
          position: 1,
          coverData: {
            title: cookbook.title || '',
            subtitle: cookbook.description || '',
            layout: 'cover-layout-one',
          },
          layout: 'cover-layout-one',
        },
        {
          pageId: 'intro',
          pageType: PageType.INTRO,
          position: 2,
          introData: {
            customContent: '',
            layout: 'intro-layout-one',
          },
          layout: 'intro-layout-one',
        },
        {
          pageId: 'toc',
          pageType: PageType.TOC,
          position: 3,
        },
      ];

      // Add recipe pages if recipe IDs are provided
      if (data.recipeIds && data.recipeIds.length > 0) {
        console.log(`📥 Adding ${data.recipeIds.length} recipe(s) to book`);

        // Fetch all recipe data
        const recipeDataPromises = data.recipeIds.map((recipeId) =>
          fetchRecipeData(recipeId)
        );
        const recipesData = await Promise.all(recipeDataPromises);

        console.log('📋 Fetched recipe data:', recipesData);

        // If updating existing book, append to existing pages
        if (currentBook) {
          console.log('📝 Updating existing book with new recipes');

          // Get the highest position number from existing pages
          const maxPosition = currentBook.pages.length > 0
            ? Math.max(...currentBook.pages.map(p => p.position))
            : 3; // Start after default pages (cover, intro, toc)

          // Create individual recipe pages for each recipe
          recipesData.forEach((recipeData, index) => {
            if (recipeData) {
              const recipePage: IPage = {
                pageId: 'recipe-' + new Types.ObjectId(),
                pageType: PageType.RECIPE,
                position: maxPosition + index + 1,
                recipe: [{
                  ...recipeData,
                  order: index + 1,
                  layout: 'layout-one'
                }],
                layout: 'layout-one',
                lastEditedAt: new Date(),
              };
              currentBook.pages.push(recipePage);
            }
          });

          // Update sections if provided
          if (data.sections) {
            currentBook.sections = data.sections.map((section) => ({
              ...section,
              lastEditedAt: new Date(),
            }));
          }

          await currentBook.save();

          console.log(`✅ Updated book with ${recipesData.length} new recipe pages. Total pages: ${currentBook.pages.length}`);

          return currentBook;
        }

        // For new books, create individual recipe pages
        console.log('📘 Creating new book with recipe pages');
        recipesData.forEach((recipeData, index) => {
          if (recipeData) {
            defaultPages.push({
              pageId: 'recipe-' + new Types.ObjectId(),
              pageType: PageType.RECIPE,
              position: 4 + index,
              recipe: [{
                ...recipeData,
                order: index + 1,
                layout: 'layout-one'
              }],
              layout: 'layout-one',
            });
          }
        });
      }

      // Create new book with pages
      const bookData: any = {
        name: data.name || `${cookbook.title || 'My Cookbook'} - ${new Date().toLocaleDateString()}`,
        description: data.description || cookbook.description || 'My cookbook book',
        cookbook: new Types.ObjectId(data.cookbookId),
        pages: data.pages || defaultPages,
        sections: data.sections
          ? data.sections.map((section) => ({
              ...section,
              lastEditedAt: new Date(),
            }))
          : [],
        status: BookStatus.DRAFT,
        isPublic: false,
      };

      const book = new Book(bookData);
      await book.save();

      // Add book to cookbook's books array
      cookbook.books.push(book._id);
      await cookbook.save();

      logger.info('Book created', {
        bookId: book._id,
        userId,
        cookbookId: data.cookbookId,
        recipeCount: data.recipeIds?.length || 0,
        pageCount: book.pages.length,
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
          throw Errors.forbidden(
            'You do not have permission to access this book'
          );
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
  async getMyBooks(
    userId: string,
    query: {
      page?: number;
      limit?: number;
      status?: BookStatus;
      isPublic?: boolean;
      cookbookId?: string;
    } = {}
  ): Promise<{
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

      const cookbookIds = userCookbooks.map((cb) => cb._id);

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
        throw Errors.forbidden(
          'You can only update books from your own cookbooks'
        );
      }

      // Update fields
      if (updates.name !== undefined) book.name = updates.name;
      if (updates.description !== undefined) book.description = updates.description;
      if (updates.status !== undefined) book.status = updates.status;
      if (updates.isPublic !== undefined) book.isPublic = updates.isPublic;

      // Update layout (for backward compatibility with old schema)
      if (updates.layout !== undefined) {
        console.log(
          `📐 [OLD SCHEMA] Updating book layout: ${(book as any).layout} -> ${
            updates.layout
          }`
        );
        (book as any).layout = updates.layout;
      }

      // Update pages if provided
      if (updates.pages !== undefined) {
        book.pages = updates.pages.map((page) => ({
          ...page,
          lastEditedAt: new Date(),
        }));
      }

      // Update sections (for backward compatibility)
      if (updates.sections !== undefined) {
        updates.sections.forEach((updatedSection) => {
          const existingIndex = book.sections?.findIndex(
            (s) => s.sectionId === updatedSection.sectionId
          );

          if (
            existingIndex !== undefined &&
            existingIndex !== -1 &&
            book.sections
          ) {
            // Update existing section
            book.sections[existingIndex] = {
              ...updatedSection,
              lastEditedAt: new Date(),
            };
          } else {
            // Add new section
            if (!book.sections) book.sections = [];
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
        throw Errors.forbidden(
          'You can only delete books from your own cookbooks'
        );
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
   * Add a new page to a book
   */
  async addPage(
    bookId: string,
    userId: string,
    pageData: CreatePageData
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
        throw Errors.forbidden('You can only add pages to your own books');
      }

      // Generate unique page ID
      const pageId = `${pageData.pageType}-${new Types.ObjectId()}`;

      // Create new page
      const newPage: IPage = {
        pageId,
        pageType: pageData.pageType,
        position: pageData.position,
        coverData: pageData.coverData,
        introData: pageData.introData,
        recipe: pageData.recipe,
        extraPageData: pageData.extraPageData,
        layout: pageData.layout,
        lastEditedAt: new Date(),
      };

      // Add page to book
      book.pages.push(newPage);

      // Reorder pages if needed
      book.pages.sort((a, b) => a.position - b.position);

      await book.save();

      logger.info('Page added to book', {
        bookId,
        userId,
        pageId,
        pageType: pageData.pageType,
      });

      return book;
    } catch (error) {
      logger.error('Error adding page to book', { error, bookId });
      throw error;
    }
  }

  /**
   * Update a specific page in a book
   */
  async updatePage(
    bookId: string,
    pageId: string,
    userId: string,
    updates: UpdatePageData
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
        throw Errors.forbidden('You can only update pages in your own books');
      }

      // Find page index
      const pageIndex = book.pages.findIndex((p) => p.pageId === pageId);

      if (pageIndex === -1) {
        throw Errors.notFound('Page not found in book');
      }

      // Update page fields
      const page = book.pages[pageIndex];

      console.log('🔧 BEFORE UPDATE:', {
        pageId,
        currentLayout: page.layout,
        incomingUpdates: updates,
      });

      if (updates.position !== undefined) page.position = updates.position;
      if (updates.coverData !== undefined) page.coverData = updates.coverData;
      if (updates.introData !== undefined) page.introData = updates.introData;
      if (updates.recipe !== undefined) page.recipe = updates.recipe;
      if (updates.extraPageData !== undefined)
        page.extraPageData = updates.extraPageData;
      if (updates.layout !== undefined) {
        console.log(`📐 UPDATING LAYOUT: ${page.layout} -> ${updates.layout}`);
        page.layout = updates.layout;
      }
      if (updates.editedContent !== undefined)
        page.editedContent = updates.editedContent;

      page.lastEditedAt = new Date();

      console.log('🔧 AFTER UPDATE (before save):', {
        pageId,
        newLayout: page.layout,
      });

      // Reorder pages if position changed
      if (updates.position !== undefined) {
        book.pages.sort((a, b) => a.position - b.position);
      }

      await book.save();

      console.log('💾 SAVED TO DATABASE:', {
        pageId,
        savedLayout: book.pages[pageIndex].layout,
      });

      logger.info('Page updated in book', { bookId, userId, pageId });

      return book;
    } catch (error) {
      logger.error('Error updating page in book', { error, bookId, pageId });
      throw error;
    }
  }

  /**
   * Delete a page from a book
   */
  async deletePage(
    bookId: string,
    pageId: string,
    userId: string
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
        throw Errors.forbidden('You can only delete pages from your own books');
      }

      // Find page index
      const pageIndex = book.pages.findIndex((p) => p.pageId === pageId);

      if (pageIndex === -1) {
        throw Errors.notFound('Page not found in book');
      }

      // Remove page
      book.pages.splice(pageIndex, 1);

      await book.save();

      logger.info('Page deleted from book', { bookId, userId, pageId });

      return book;
    } catch (error) {
      logger.error('Error deleting page from book', { error, bookId, pageId });
      throw error;
    }
  }

  /**
   * Reorder pages in a book
   */
  async reorderPages(
    bookId: string,
    userId: string,
    pageOrder: { pageId: string; position: number }[]
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
        throw Errors.forbidden('You can only reorder pages in your own books');
      }

      // Update positions for each page
      pageOrder.forEach(({ pageId, position }) => {
        const page = book.pages.find((p) => p.pageId === pageId);
        if (page) {
          page.position = position;
        }
      });

      // Sort pages by position
      book.pages.sort((a, b) => a.position - b.position);

      await book.save();

      logger.info('Pages reordered in book', {
        bookId,
        userId,
        pageCount: pageOrder.length,
      });

      return book;
    } catch (error) {
      logger.error('Error reordering pages in book', { error, bookId });
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
