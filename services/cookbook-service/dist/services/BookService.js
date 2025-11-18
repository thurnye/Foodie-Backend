"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const recipeClient_1 = require("./../utils/recipeClient");
const mongoose_1 = require("mongoose");
const libs_1 = require("@foodie/libs");
const Book_1 = __importDefault(require("../db/Book"));
const Cookbook_1 = __importDefault(require("../db/Cookbook"));
const book_types_1 = require("../Types/book.types");
class BookService {
    async createBook(userId, data) {
        try {
            console.log('📥 BookService.createBook called with:', {
                bookId: data.bookId,
                cookbookId: data.cookbookId,
                recipeCount: data.recipeIds?.length
            });
            let currentBook = null;
            if (data.bookId) {
                currentBook = await Book_1.default.findOne({
                    _id: data.bookId,
                    isActive: true,
                });
                console.log('🔍 Found existing book:', currentBook ? 'YES' : 'NO');
                if (currentBook && currentBook.cookbook.toString() !== data.cookbookId) {
                    throw libs_1.Errors.badRequest('Book does not belong to the specified cookbook');
                }
            }
            const cookbook = await Cookbook_1.default.findOne({
                _id: data.cookbookId,
                isActive: true,
            });
            if (!cookbook) {
                throw libs_1.Errors.notFound('Cookbook not found');
            }
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only create books from your own cookbooks');
            }
            const defaultCoverData = {
                pageId: 'cover',
                pageType: book_types_1.PageType.COVER,
                position: 1,
                title: cookbook.title || '',
                subtitle: cookbook.description || '',
                layout: 'cover-layout-one',
            };
            const defaultIntroData = {
                pageId: 'intro',
                pageType: book_types_1.PageType.INTRO,
                position: 2,
                customContent: '',
                layout: 'intro-layout-one',
            };
            let recipeArray = [];
            if (data.recipeIds && data.recipeIds.length > 0) {
                console.log(`📥 Adding ${data.recipeIds.length} recipe(s) to book`);
                const recipeDataPromises = data.recipeIds.map((recipeId) => (0, recipeClient_1.fetchRecipeData)(recipeId));
                const recipesData = await Promise.all(recipeDataPromises);
                console.log('📋 Fetched recipe data:', recipesData);
                if (currentBook) {
                    console.log('📝 Updating existing book with new recipes');
                    const maxPosition = currentBook.recipe && currentBook.recipe.length > 0
                        ? Math.max(...currentBook.recipe.map((r) => r.position))
                        : 3;
                    recipesData.forEach((recipeData, index) => {
                        if (recipeData) {
                            const recipePage = {
                                ...recipeData,
                                pageId: 'recipe-' + new mongoose_1.Types.ObjectId(),
                                pageType: book_types_1.PageType.RECIPE,
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
                console.log('📘 Creating new book with recipe pages');
                recipesData.forEach((recipeData, index) => {
                    if (recipeData) {
                        recipeArray.push({
                            ...recipeData,
                            pageId: 'recipe-' + new mongoose_1.Types.ObjectId(),
                            pageType: book_types_1.PageType.RECIPE,
                            position: 4 + index,
                            order: index + 1,
                            layout: 'layout-one'
                        });
                    }
                });
            }
            const bookData = {
                name: data.name || `${cookbook.title || 'My Cookbook'} - ${new Date().toLocaleDateString()}`,
                description: data.description || cookbook.description || 'My cookbook book',
                cookbook: new mongoose_1.Types.ObjectId(data.cookbookId),
                coverData: defaultCoverData,
                introData: defaultIntroData,
                recipe: recipeArray,
                sections: data.sections
                    ? data.sections.map((section) => ({
                        ...section,
                        lastEditedAt: new Date(),
                    }))
                    : [],
                status: book_types_1.BookStatus.DRAFT,
                isPublic: false,
            };
            const book = new Book_1.default(bookData);
            await book.save();
            cookbook.books.push(book._id);
            await cookbook.save();
            libs_1.logger.info('Book created', {
                bookId: book._id,
                userId,
                cookbookId: data.cookbookId,
                recipeCount: data.recipeIds?.length || 0,
                recipeArrayLength: book.recipe?.length || 0,
            });
            return book;
        }
        catch (error) {
            libs_1.logger.error('Error creating book', { error, userId });
            throw error;
        }
    }
    async getBookById(bookId, userId) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            }).populate('cookbook');
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            const cookbook = book.cookbook;
            if (userId) {
                const isAuthor = cookbook.author?.toString() === userId;
                if (!isAuthor && !book.isPublic) {
                    throw libs_1.Errors.forbidden('You do not have permission to access this book');
                }
            }
            else if (!book.isPublic) {
                throw libs_1.Errors.forbidden('This book is private');
            }
            return book;
        }
        catch (error) {
            libs_1.logger.error('Error fetching book', { error, bookId });
            throw error;
        }
    }
    async getMyBooks(userId, query = {}) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;
            const userCookbooks = await Cookbook_1.default.find({
                author: userId,
                isActive: true,
            }).select('_id');
            const cookbookIds = userCookbooks.map((cb) => cb._id);
            const filter = {
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
            const totalBooks = await Book_1.default.countDocuments(filter);
            const books = await Book_1.default.find(filter)
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
        }
        catch (error) {
            libs_1.logger.error('Error fetching user books', { error, userId });
            throw error;
        }
    }
    async updateBook(bookId, userId, updates) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            }).populate('cookbook');
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            const cookbook = book.cookbook;
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only update books from your own cookbooks');
            }
            if (updates.name !== undefined)
                book.name = updates.name;
            if (updates.description !== undefined)
                book.description = updates.description;
            if (updates.status !== undefined)
                book.status = updates.status;
            if (updates.isPublic !== undefined)
                book.isPublic = updates.isPublic;
            if (updates.layout !== undefined) {
                console.log(`📐 [OLD SCHEMA] Updating book layout: ${book.layout} -> ${updates.layout}`);
                book.layout = updates.layout;
            }
            if (updates.pages !== undefined) {
                console.warn('⚠️  WARNING: Updating book.pages is deprecated. Use individual page update endpoints instead.');
            }
            if (updates.sections !== undefined) {
                updates.sections.forEach((updatedSection) => {
                    const existingIndex = book.sections?.findIndex((s) => s.sectionId === updatedSection.sectionId);
                    if (existingIndex !== undefined &&
                        existingIndex !== -1 &&
                        book.sections) {
                        book.sections[existingIndex] = {
                            ...updatedSection,
                            lastEditedAt: new Date(),
                        };
                    }
                    else {
                        if (!book.sections)
                            book.sections = [];
                        book.sections.push({
                            ...updatedSection,
                            lastEditedAt: new Date(),
                        });
                    }
                });
            }
            if (updates.status === book_types_1.BookStatus.PUBLISHED && !book.publishedAt) {
                book.publishedAt = new Date();
            }
            await book.save();
            libs_1.logger.info('Book updated', { bookId, userId });
            return book;
        }
        catch (error) {
            libs_1.logger.error('Error updating book', { error, bookId });
            throw error;
        }
    }
    async deleteBook(bookId, userId) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            }).populate('cookbook');
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            const cookbook = book.cookbook;
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only delete books from your own cookbooks');
            }
            book.isActive = false;
            await book.save();
            await Cookbook_1.default.updateOne({ _id: cookbook._id }, { $pull: { books: book._id } });
            libs_1.logger.info('Book deleted', { bookId, userId });
        }
        catch (error) {
            libs_1.logger.error('Error deleting book', { error, bookId });
            throw error;
        }
    }
    async addPage(bookId, userId, pageData) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            }).populate('cookbook');
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            const cookbook = book.cookbook;
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only add pages to your own books');
            }
            const pageId = `${pageData.pageType}-${new mongoose_1.Types.ObjectId()}`;
            if (pageData.pageType === book_types_1.PageType.RECIPE && pageData.recipe) {
                if (!book.recipe) {
                    book.recipe = [];
                }
                const recipePage = {
                    pageId,
                    pageType: book_types_1.PageType.RECIPE,
                    position: pageData.position,
                    ...pageData.recipe,
                    layout: pageData.layout || 'layout-one',
                };
                book.recipe.push(recipePage);
                book.recipe.sort((a, b) => a.position - b.position);
                book.markModified('recipe');
            }
            else if (pageData.pageType === book_types_1.PageType.COVER && pageData.coverData) {
                book.coverData = {
                    ...pageData.coverData,
                    pageId,
                    pageType: book_types_1.PageType.COVER,
                    position: pageData.position,
                };
                book.markModified('coverData');
            }
            else if (pageData.pageType === book_types_1.PageType.INTRO && pageData.introData) {
                book.introData = {
                    ...pageData.introData,
                    pageId,
                    pageType: book_types_1.PageType.INTRO,
                    position: pageData.position,
                };
                book.markModified('introData');
            }
            else if (pageData.pageType === book_types_1.PageType.EXTRA && pageData.extraPageData) {
                book.extraPageData = {
                    ...pageData.extraPageData,
                    pageId,
                    position: pageData.position,
                };
                book.markModified('extraPageData');
            }
            else {
                throw libs_1.Errors.badRequest('Invalid page type or missing page data');
            }
            await book.save();
            libs_1.logger.info('Page added to book', {
                bookId,
                userId,
                pageId,
                pageType: pageData.pageType,
            });
            return book;
        }
        catch (error) {
            libs_1.logger.error('Error adding page to book', { error, bookId });
            throw error;
        }
    }
    async updatePage(bookId, pageId, userId, updates) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            }).populate('cookbook');
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            const cookbook = book.cookbook;
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only update pages in your own books');
            }
            const recipeIndex = book.recipe?.findIndex((r) => r.pageId === pageId) ?? -1;
            console.log('🔧 BEFORE UPDATE:', {
                pageId,
                recipeIndex,
                recipeCount: book.recipe?.length,
                incomingUpdates: updates,
            });
            if (recipeIndex !== -1 && book.recipe) {
                const recipePage = book.recipe[recipeIndex];
                console.log(`📐 Current recipe layout: ${recipePage.layout}`);
                if (updates.position !== undefined)
                    recipePage.position = updates.position;
                if (updates.layout !== undefined) {
                    console.log(`📐 UPDATING RECIPE LAYOUT: ${recipePage.layout} -> ${updates.layout}`);
                    recipePage.layout = updates.layout;
                }
                if (updates.position !== undefined) {
                    book.recipe.sort((a, b) => a.position - b.position);
                }
                book.markModified('recipe');
                console.log('🔖 Marked recipe array as modified');
                await book.save();
                console.log('💾 Book saved to database');
                console.log('💾 SAVED TO DATABASE:', {
                    pageId,
                    savedLayout: book.recipe[recipeIndex].layout,
                });
            }
            else if (book.coverData && pageId === book.coverData.pageId) {
                if (updates.layout !== undefined && book.coverData) {
                    book.coverData.layout = updates.layout;
                }
                if (updates.coverData !== undefined) {
                    book.coverData = { ...book.coverData, ...updates.coverData };
                }
                book.markModified('coverData');
                await book.save();
            }
            else if (book.introData && pageId === book.introData.pageId) {
                if (updates.layout !== undefined && book.introData) {
                    book.introData.layout = updates.layout;
                }
                if (updates.introData !== undefined) {
                    book.introData = { ...book.introData, ...updates.introData };
                }
                book.markModified('introData');
                await book.save();
            }
            else if (book.extraPageData && pageId === book.extraPageData.pageId) {
                if (updates.layout !== undefined && book.extraPageData) {
                    book.extraPageData.layout = updates.layout;
                }
                if (updates.extraPageData !== undefined) {
                    book.extraPageData = { ...book.extraPageData, ...updates.extraPageData };
                }
                book.markModified('extraPageData');
                await book.save();
            }
            else {
                throw libs_1.Errors.notFound('Page not found in book');
            }
            libs_1.logger.info('Page updated in book', { bookId, userId, pageId });
            return book;
        }
        catch (error) {
            libs_1.logger.error('Error updating page in book', { error, bookId, pageId });
            throw error;
        }
    }
    async deletePage(bookId, pageId, userId) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            }).populate('cookbook');
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            const cookbook = book.cookbook;
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only delete pages from your own books');
            }
            const recipeIndex = book.recipe?.findIndex((r) => r.pageId === pageId) ?? -1;
            if (recipeIndex !== -1 && book.recipe) {
                book.recipe.splice(recipeIndex, 1);
                book.markModified('recipe');
                await book.save();
            }
            else if (book.coverData && pageId === book.coverData.pageId) {
                throw libs_1.Errors.badRequest('Cannot delete cover page');
            }
            else if (book.introData && pageId === book.introData.pageId) {
                throw libs_1.Errors.badRequest('Cannot delete intro page');
            }
            else if (book.extraPageData && pageId === book.extraPageData.pageId) {
                book.extraPageData = undefined;
                book.markModified('extraPageData');
                await book.save();
            }
            else {
                throw libs_1.Errors.notFound('Page not found in book');
            }
            libs_1.logger.info('Page deleted from book', { bookId, userId, pageId });
            return book;
        }
        catch (error) {
            libs_1.logger.error('Error deleting page from book', { error, bookId, pageId });
            throw error;
        }
    }
    async reorderPages(bookId, userId, pageOrder) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            }).populate('cookbook');
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            const cookbook = book.cookbook;
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only reorder pages in your own books');
            }
            pageOrder.forEach(({ pageId, position }) => {
                const recipeIndex = book.recipe?.findIndex((r) => r.pageId === pageId) ?? -1;
                if (recipeIndex !== -1 && book.recipe) {
                    book.recipe[recipeIndex].position = position;
                    book.markModified('recipe');
                }
                else if (book.coverData && pageId === book.coverData.pageId) {
                    book.coverData.position = position;
                    book.markModified('coverData');
                }
                else if (book.introData && pageId === book.introData.pageId) {
                    book.introData.position = position;
                    book.markModified('introData');
                }
                else if (book.extraPageData && pageId === book.extraPageData.pageId) {
                    book.extraPageData.position = position;
                    book.markModified('extraPageData');
                }
            });
            if (book.recipe && book.recipe.length > 0) {
                book.recipe.sort((a, b) => a.position - b.position);
                book.markModified('recipe');
            }
            await book.save();
            libs_1.logger.info('Pages reordered in book', {
                bookId,
                userId,
                pageCount: pageOrder.length,
            });
            return book;
        }
        catch (error) {
            libs_1.logger.error('Error reordering pages in book', { error, bookId });
            throw error;
        }
    }
    async publishBook(bookId, userId) {
        try {
            return await this.updateBook(bookId, userId, {
                status: book_types_1.BookStatus.PUBLISHED,
                isPublic: true,
            });
        }
        catch (error) {
            libs_1.logger.error('Error publishing book', { error, bookId });
            throw error;
        }
    }
}
exports.default = new BookService();
//# sourceMappingURL=BookService.js.map