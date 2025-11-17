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
            const defaultPages = [
                {
                    pageId: 'cover',
                    pageType: book_types_1.PageType.COVER,
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
                    pageType: book_types_1.PageType.INTRO,
                    position: 2,
                    introData: {
                        customContent: '',
                        layout: 'intro-layout-one',
                    },
                    layout: 'intro-layout-one',
                },
                {
                    pageId: 'toc',
                    pageType: book_types_1.PageType.TOC,
                    position: 3,
                },
            ];
            if (data.recipeIds && data.recipeIds.length > 0) {
                console.log(`📥 Creating book with ${data.recipeIds.length} recipe(s)`);
                const recipeDataPromises = data.recipeIds.map((recipeId) => (0, recipeClient_1.fetchRecipeData)(recipeId));
                const recipesData = await Promise.all(recipeDataPromises);
                let recipeOrder = 1;
                console.log(` Adding recipe pages to book...`, recipesData);
                recipesData.forEach((recipe) => ({
                    ...recipe,
                    order: recipeOrder++,
                    layout: 'layout-one'
                }));
                defaultPages.push({
                    pageId: 'recipe-' + new mongoose_1.Types.ObjectId(),
                    pageType: book_types_1.PageType.RECIPE,
                    position: 4,
                    recipe: recipesData.filter((r) => r !== null),
                });
            }
            const bookData = {
                cookbook: new mongoose_1.Types.ObjectId(data.cookbookId),
                pages: data.pages || defaultPages,
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
                pageCount: book.pages.length,
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
            if (updates.status !== undefined)
                book.status = updates.status;
            if (updates.isPublic !== undefined)
                book.isPublic = updates.isPublic;
            if (updates.layout !== undefined) {
                console.log(`📐 [OLD SCHEMA] Updating book layout: ${book.layout} -> ${updates.layout}`);
                book.layout = updates.layout;
            }
            if (updates.pages !== undefined) {
                book.pages = updates.pages.map((page) => ({
                    ...page,
                    lastEditedAt: new Date(),
                }));
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
            const newPage = {
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
            book.pages.push(newPage);
            book.pages.sort((a, b) => a.position - b.position);
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
            const pageIndex = book.pages.findIndex((p) => p.pageId === pageId);
            if (pageIndex === -1) {
                throw libs_1.Errors.notFound('Page not found in book');
            }
            const page = book.pages[pageIndex];
            console.log('🔧 BEFORE UPDATE:', {
                pageId,
                currentLayout: page.layout,
                incomingUpdates: updates,
            });
            if (updates.position !== undefined)
                page.position = updates.position;
            if (updates.coverData !== undefined)
                page.coverData = updates.coverData;
            if (updates.introData !== undefined)
                page.introData = updates.introData;
            if (updates.recipe !== undefined)
                page.recipe = updates.recipe;
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
            if (updates.position !== undefined) {
                book.pages.sort((a, b) => a.position - b.position);
            }
            await book.save();
            console.log('💾 SAVED TO DATABASE:', {
                pageId,
                savedLayout: book.pages[pageIndex].layout,
            });
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
            const pageIndex = book.pages.findIndex((p) => p.pageId === pageId);
            if (pageIndex === -1) {
                throw libs_1.Errors.notFound('Page not found in book');
            }
            book.pages.splice(pageIndex, 1);
            await book.save();
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
                const page = book.pages.find((p) => p.pageId === pageId);
                if (page) {
                    page.position = position;
                }
            });
            book.pages.sort((a, b) => a.position - b.position);
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