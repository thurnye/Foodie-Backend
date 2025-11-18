import { fetchRecipeData } from './../utils/recipeClient';
import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import Book from '../db/Book';
import Cookbook from '../db/Cookbook';
import {
  IBook,
  IBookSection,
  BookStatus,
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
  sections?: IBookSection[];
  recipeIds?: string[]; // Recipe IDs to fetch and add as recipes
}

interface UpdateBookData {
  name?: string;
  description?: string;
  pages?: any[]; // Deprecated - kept for backward compatibility
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

      // Initialize default cover and intro data
      const defaultCoverData: ICoverPageData = {
        pageId: 'cover',
        pageType: PageType.COVER,
        position: 1,
        title: cookbook.title || '',
        subtitle: cookbook.description || '',
        layout: 'cover-layout-one',
      };

      const defaultIntroData: IIntroPageData = {
        pageId: 'intro',
        pageType: PageType.INTRO,
        position: 2,
        customContent: '',
        layout: 'intro-layout-one',
      };

      // Prepare recipe array
      let recipeArray: any[] = [];

      // Add recipe pages if recipe IDs are provided
      if (data.recipeIds && data.recipeIds.length > 0) {
        console.log(`📥 Adding ${data.recipeIds.length} recipe(s) to book`);

        // Fetch all recipe data
        const recipeDataPromises = data.recipeIds.map((recipeId) =>
          fetchRecipeData(recipeId)
        );
        const recipesData = await Promise.all(recipeDataPromises);

        console.log('📋 Fetched recipe data:', recipesData);

        // If updating existing book, append to existing recipes
        if (currentBook) {
          console.log('📝 Updating existing book with new recipes');

          // Get the highest position number from existing recipes
          const maxPosition = currentBook.recipe && currentBook.recipe.length > 0
            ? Math.max(...currentBook.recipe.map((r: any) => r.position))
            : 3; // Start after default pages (cover, intro, toc)

          // Add new recipes
          recipesData.forEach((recipeData, index) => {
            if (recipeData) {
              const recipePage: any = {
                ...recipeData,
                pageId: 'recipe-' + new Types.ObjectId(),
                pageType: PageType.RECIPE,
                position: maxPosition + index + 1,
                order: (currentBook.recipe?.length || 0) + index + 1,
                layout: 'layout-one'
              };

              if (!currentBook.recipe) {
                currentBook.recipe = [];
              }
              currentBook.recipe.push(recipePage);
            }
          });

          // Update sections if provided
          if (data.sections) {
            currentBook.sections = data.sections.map((section) => ({
              ...section,
              lastEditedAt: new Date(),
            }));
          }

          currentBook.markModified('recipe');
          await currentBook.save();

          console.log(`✅ Updated book with ${recipesData.length} new recipe pages. Total recipes: ${currentBook.recipe?.length || 0}`);

          return currentBook;
        }

        // For new books, create recipe array
        console.log('📘 Creating new book with recipe pages');
        recipesData.forEach((recipeData, index) => {
          if (recipeData) {
            recipeArray.push({
              ...recipeData,
              pageId: 'recipe-' + new Types.ObjectId(),
              pageType: PageType.RECIPE,
              position: 4 + index,
              order: index + 1,
              layout: 'layout-one'
            });
          }
        });
      }

      // Create new book with new schema
      const bookData: any = {
        name: data.name || `${cookbook.title || 'My Cookbook'} - ${new Date().toLocaleDateString()}`,
        description: data.description || cookbook.description || 'My cookbook book',
        cookbook: new Types.ObjectId(data.cookbookId),
        coverData: defaultCoverData,
        introData: defaultIntroData,
        recipe: recipeArray,
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
        recipeArrayLength: book.recipe?.length || 0,
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

      // Update pages is not supported in new schema - pages are now individual fields
      // (coverData, introData, recipe[], extraPageData)
      if (updates.pages !== undefined) {
        console.warn('⚠️  WARNING: Updating book.pages is deprecated. Use individual page update endpoints instead.');
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

      // Add page based on type
      if (pageData.pageType === PageType.RECIPE && pageData.recipe) {
        // Add recipe page to recipe array
        if (!book.recipe) {
          book.recipe = [];
        }

        const recipePage: any = {
          pageId,
          pageType: PageType.RECIPE,
          position: pageData.position,
          ...pageData.recipe,
          layout: pageData.layout || 'layout-one',
        };

        book.recipe.push(recipePage);
        book.recipe.sort((a: any, b: any) => a.position - b.position);
        book.markModified('recipe');
      } else if (pageData.pageType === PageType.COVER && pageData.coverData) {
        // Set cover data
        book.coverData = {
          ...pageData.coverData,
          pageId,
          pageType: PageType.COVER,
          position: pageData.position,
        };
        book.markModified('coverData');
      } else if (pageData.pageType === PageType.INTRO && pageData.introData) {
        // Set intro data
        book.introData = {
          ...pageData.introData,
          pageId,
          pageType: PageType.INTRO,
          position: pageData.position,
        };
        book.markModified('introData');
      } else if (pageData.pageType === PageType.EXTRA && pageData.extraPageData) {
        // Set extra page data
        book.extraPageData = {
          ...pageData.extraPageData,
          pageId,
          position: pageData.position,
        };
        book.markModified('extraPageData');
      } else {
        throw Errors.badRequest('Invalid page type or missing page data');
      }

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

      // Find if it's a recipe page in the recipe array
      const recipeIndex = book.recipe?.findIndex((r: any) => r.pageId === pageId) ?? -1;

      console.log('🔧 BEFORE UPDATE:', {
        pageId,
        recipeIndex,
        recipeCount: book.recipe?.length,
        incomingUpdates: updates,
      });

      if (recipeIndex !== -1 && book.recipe) {
        // Update recipe page
        const recipePage = book.recipe[recipeIndex];

        console.log(`📐 Current recipe layout: ${recipePage.layout}`);

        if (updates.position !== undefined) recipePage.position = updates.position;
        if (updates.layout !== undefined) {
          console.log(`📐 UPDATING RECIPE LAYOUT: ${recipePage.layout} -> ${updates.layout}`);
          recipePage.layout = updates.layout;
        }

        // Reorder recipes if position changed
        if (updates.position !== undefined) {
          book.recipe.sort((a: any, b: any) => a.position - b.position);
        }

        // Mark the recipe array as modified so Mongoose detects the change
        book.markModified('recipe');

        console.log('🔖 Marked recipe array as modified');

        await book.save();

        console.log('💾 Book saved to database');

        console.log('💾 SAVED TO DATABASE:', {
          pageId,
          savedLayout: book.recipe[recipeIndex].layout,
        });
      } else if (book.coverData && pageId === book.coverData.pageId) {
        // Update cover page
        if (updates.layout !== undefined && book.coverData) {
          book.coverData.layout = updates.layout;
        }
        if (updates.coverData !== undefined) {
          book.coverData = { ...book.coverData, ...updates.coverData };
        }
        book.markModified('coverData');
        await book.save();
      } else if (book.introData && pageId === book.introData.pageId) {
        // Update intro page
        if (updates.layout !== undefined && book.introData) {
          book.introData.layout = updates.layout;
        }
        if (updates.introData !== undefined) {
          book.introData = { ...book.introData, ...updates.introData };
        }
        book.markModified('introData');
        await book.save();
      } else if (book.extraPageData && pageId === book.extraPageData.pageId) {
        // Update extra page
        if (updates.layout !== undefined && book.extraPageData) {
          book.extraPageData.layout = updates.layout;
        }
        if (updates.extraPageData !== undefined) {
          book.extraPageData = { ...book.extraPageData, ...updates.extraPageData };
        }
        book.markModified('extraPageData');
        await book.save();
      } else {
        throw Errors.notFound('Page not found in book');
      }

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

      // Find if it's a recipe page in the recipe array
      const recipeIndex = book.recipe?.findIndex((r: any) => r.pageId === pageId) ?? -1;

      if (recipeIndex !== -1 && book.recipe) {
        // Remove recipe page
        book.recipe.splice(recipeIndex, 1);
        book.markModified('recipe');
        await book.save();
      } else if (book.coverData && pageId === book.coverData.pageId) {
        // Cannot delete cover page
        throw Errors.badRequest('Cannot delete cover page');
      } else if (book.introData && pageId === book.introData.pageId) {
        // Cannot delete intro page
        throw Errors.badRequest('Cannot delete intro page');
      } else if (book.extraPageData && pageId === book.extraPageData.pageId) {
        // Delete extra page
        book.extraPageData = undefined;
        book.markModified('extraPageData');
        await book.save();
      } else {
        throw Errors.notFound('Page not found in book');
      }

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
        // Check if it's a recipe page
        const recipeIndex = book.recipe?.findIndex((r: any) => r.pageId === pageId) ?? -1;
        if (recipeIndex !== -1 && book.recipe) {
          book.recipe[recipeIndex].position = position;
          book.markModified('recipe');
        }
        // Check cover page
        else if (book.coverData && pageId === book.coverData.pageId) {
          book.coverData.position = position;
          book.markModified('coverData');
        }
        // Check intro page
        else if (book.introData && pageId === book.introData.pageId) {
          book.introData.position = position;
          book.markModified('introData');
        }
        // Check extra page
        else if (book.extraPageData && pageId === book.extraPageData.pageId) {
          book.extraPageData.position = position;
          book.markModified('extraPageData');
        }
      });

      // Sort recipe pages by position
      if (book.recipe && book.recipe.length > 0) {
        book.recipe.sort((a: any, b: any) => a.position - b.position);
        book.markModified('recipe');
      }

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
