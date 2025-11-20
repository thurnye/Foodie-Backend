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
                paperSize: book_types_1.PageLayoutFormat.A4,
            };
            const defaultIntroData = {
                pageId: 'intro',
                pageType: book_types_1.PageType.INTRO,
                position: 2,
                customContent: '',
                layout: 'intro-layout-one',
                paperSize: book_types_1.PageLayoutFormat.A4,
            };
            const defaultTocData = {
                pageId: 'toc',
                pageType: book_types_1.PageType.TOC,
                position: 3,
                customContent: '',
                layout: 'toc-layout-one',
                paperSize: book_types_1.PageLayoutFormat.A4,
            };
            const defaultBackCoverData = {
                pageId: 'back-cover',
                pageType: book_types_1.PageType.BACK_COVER,
                position: 999,
                title: cookbook.title || '',
                subtitle: '',
                layout: 'back-cover-layout-one',
                paperSize: book_types_1.PageLayoutFormat.A4,
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
                                layout: 'layout-one',
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
                tocData: defaultTocData,
                backCoverData: defaultBackCoverData,
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
    async ensureRequiredPages(book) {
        let updated = false;
        if (!book.coverData) {
            const cookbook = book.cookbook;
            book.coverData = {
                pageId: 'cover',
                pageType: book_types_1.PageType.COVER,
                position: 1,
                title: cookbook?.title || book.name || '',
                subtitle: cookbook?.description || book.description || '',
                layout: 'cover-layout-one',
                paperSize: book_types_1.PageLayoutFormat.A4,
            };
            book.markModified('coverData');
            updated = true;
        }
        if (!book.introData) {
            book.introData = {
                pageId: 'intro',
                pageType: book_types_1.PageType.INTRO,
                position: 2,
                customContent: '',
                layout: 'intro-layout-one',
                paperSize: book_types_1.PageLayoutFormat.A4,
            };
            book.markModified('introData');
            updated = true;
        }
        if (!book.tocData) {
            book.tocData = {
                pageId: 'toc',
                pageType: book_types_1.PageType.TOC,
                position: 3,
                customContent: '',
                layout: 'toc-layout-one',
                paperSize: book_types_1.PageLayoutFormat.A4,
            };
            book.markModified('tocData');
            updated = true;
        }
        if (!book.backCoverData) {
            const cookbook = book.cookbook;
            book.backCoverData = {
                pageId: 'back-cover',
                pageType: book_types_1.PageType.BACK_COVER,
                position: 999,
                title: cookbook?.title || book.name || '',
                subtitle: '',
                layout: 'back-cover-layout-one',
                paperSize: book_types_1.PageLayoutFormat.A4,
            };
            book.markModified('backCoverData');
            updated = true;
        }
        if (updated) {
            await book.save();
        }
        return updated;
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
            await this.ensureRequiredPages(book);
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
    async getBookByIdWithoutAuth(bookId) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            }).populate('cookbook');
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            await this.ensureRequiredPages(book);
            return book;
        }
        catch (error) {
            libs_1.logger.error('Error fetching book for rendering', { error, bookId });
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
    async updateBookUrl(bookId, bookUrl) {
        try {
            const book = await Book_1.default.findOne({
                _id: bookId,
                isActive: true,
            });
            if (!book) {
                throw libs_1.Errors.notFound('Book not found');
            }
            book.bookUrl = bookUrl;
            await book.save();
            libs_1.logger.info('Book URL updated', { bookId, bookUrl });
        }
        catch (error) {
            libs_1.logger.error('Error updating book URL', { error, bookId });
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
            else if (pageData.pageType === book_types_1.PageType.TOC && pageData.tocData) {
                book.tocData = {
                    ...pageData.tocData,
                    pageId,
                    pageType: book_types_1.PageType.TOC,
                    position: pageData.position,
                };
                book.markModified('tocData');
            }
            else if (pageData.pageType === book_types_1.PageType.BACK_COVER && pageData.backCoverData) {
                book.backCoverData = {
                    ...pageData.backCoverData,
                    pageId,
                    pageType: book_types_1.PageType.BACK_COVER,
                    position: pageData.position,
                };
                book.markModified('backCoverData');
            }
            else if (pageData.pageType === book_types_1.PageType.EXTRA && pageData.extraPageData) {
                if (!book.extraPageData) {
                    book.extraPageData = [];
                }
                const extraPage = {
                    ...pageData.extraPageData,
                    pageId,
                    position: pageData.position,
                };
                book.extraPageData.push(extraPage);
                book.extraPageData.sort((a, b) => a.position - b.position);
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
            await this.ensureRequiredPages(book);
            console.log('🔧 BEFORE UPDATE:', {
                bookId,
                pageId,
                pageType: updates.pageType,
                incomingUpdates: updates,
            });
            let updated = false;
            const pageType = updates.pageType;
            if (!pageType || pageType === book_types_1.PageType.RECIPE) {
                console.log("Book's recipe pages:", book.recipe);
                const recipePage = book.recipe?.find((r) => r._id.toString() === pageId.toString());
                console.log('🔍 Recipe page found:', recipePage);
                if (recipePage) {
                    if (updates.position !== undefined)
                        recipePage.position = updates.position;
                    if (updates.layout !== undefined)
                        recipePage.layout = updates.layout;
                    if (updates.recipe !== undefined)
                        Object.assign(recipePage, updates.recipe);
                    book.markModified('recipe');
                    updated = true;
                    if (pageType)
                        return await book.save();
                }
                else if (pageType === book_types_1.PageType.RECIPE) {
                    throw libs_1.Errors.notFound('Recipe page not found in book');
                }
            }
            if (!updated && (!pageType || pageType === book_types_1.PageType.COVER)) {
                if (book.coverData?.pageId === pageId) {
                    if (updates.layout !== undefined)
                        book.coverData.layout = updates.layout;
                    if (updates.paperSize !== undefined)
                        book.coverData.paperSize = updates.paperSize;
                    if (updates.coverData !== undefined) {
                        book.coverData = { ...book.coverData, ...updates.coverData };
                    }
                    book.markModified('coverData');
                    updated = true;
                    if (pageType)
                        return await book.save();
                }
                else if (pageType === book_types_1.PageType.COVER) {
                    throw libs_1.Errors.notFound('Cover page not found in book');
                }
            }
            if (!updated && (!pageType || pageType === book_types_1.PageType.INTRO)) {
                if (book.introData?.pageId === pageId) {
                    if (updates.layout !== undefined)
                        book.introData.layout = updates.layout;
                    if (updates.paperSize !== undefined)
                        book.introData.paperSize = updates.paperSize;
                    if (updates.introData !== undefined) {
                        book.introData = { ...book.introData, ...updates.introData };
                    }
                    book.markModified('introData');
                    updated = true;
                    if (pageType)
                        return await book.save();
                }
                else if (pageType === book_types_1.PageType.INTRO) {
                    throw libs_1.Errors.notFound('Intro page not found in book');
                }
            }
            if (!updated && (!pageType || pageType === book_types_1.PageType.TOC)) {
                if (book.tocData?.pageId === pageId) {
                    if (updates.layout !== undefined)
                        book.tocData.layout = updates.layout;
                    if (updates.paperSize !== undefined)
                        book.tocData.paperSize = updates.paperSize;
                    if (updates.tocData !== undefined) {
                        book.tocData = { ...book.tocData, ...updates.tocData };
                    }
                    book.markModified('tocData');
                    updated = true;
                    if (pageType)
                        return await book.save();
                }
                else if (pageType === book_types_1.PageType.TOC) {
                    throw libs_1.Errors.notFound('TOC page not found in book');
                }
            }
            if (!updated && (!pageType || pageType === book_types_1.PageType.BACK_COVER)) {
                if (book.backCoverData?.pageId === pageId) {
                    if (updates.layout !== undefined)
                        book.backCoverData.layout = updates.layout;
                    if (updates.paperSize !== undefined)
                        book.backCoverData.paperSize = updates.paperSize;
                    if (updates.backCoverData !== undefined) {
                        book.backCoverData = { ...book.backCoverData, ...updates.backCoverData };
                    }
                    book.markModified('backCoverData');
                    updated = true;
                    if (pageType)
                        return await book.save();
                }
                else if (pageType === book_types_1.PageType.BACK_COVER) {
                    throw libs_1.Errors.notFound('Back cover page not found in book');
                }
            }
            if (!updated && (!pageType || pageType === book_types_1.PageType.EXTRA)) {
                const extraPageIndex = book.extraPageData?.findIndex((p) => p.pageId === pageId) ?? -1;
                if (extraPageIndex !== -1 && book.extraPageData) {
                    const extraPage = book.extraPageData[extraPageIndex];
                    if (updates.layout !== undefined)
                        extraPage.layout = updates.layout;
                    if (updates.paperSize !== undefined)
                        extraPage.paperSize = updates.paperSize;
                    if (updates.position !== undefined)
                        extraPage.position = updates.position;
                    if (updates.extraPageData !== undefined) {
                        Object.assign(extraPage, updates.extraPageData);
                    }
                    if (updates.position !== undefined) {
                        book.extraPageData.sort((a, b) => a.position - b.position);
                    }
                    book.markModified('extraPageData');
                    updated = true;
                    if (pageType)
                        return await book.save();
                }
                else if (pageType === book_types_1.PageType.EXTRA) {
                    throw libs_1.Errors.notFound('Extra page not found in book');
                }
            }
            if (!updated) {
                throw libs_1.Errors.notFound('Page not found in book');
            }
            await book.save();
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
            else if (book.tocData && pageId === book.tocData.pageId) {
                throw libs_1.Errors.badRequest('Cannot delete TOC page');
            }
            else if (book.backCoverData && pageId === book.backCoverData.pageId) {
                throw libs_1.Errors.badRequest('Cannot delete back cover page');
            }
            else {
                const extraPageIndex = book.extraPageData?.findIndex((p) => p.pageId === pageId) ?? -1;
                if (extraPageIndex !== -1 && book.extraPageData) {
                    book.extraPageData.splice(extraPageIndex, 1);
                    book.markModified('extraPageData');
                    await book.save();
                }
                else {
                    throw libs_1.Errors.notFound('Page not found in book');
                }
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
                else if (book.extraPageData) {
                    const extraPage = book.extraPageData.find((p) => p.pageId === pageId);
                    if (extraPage) {
                        extraPage.position = position;
                        book.markModified('extraPageData');
                    }
                }
            });
            if (book.recipe && book.recipe.length > 0) {
                book.recipe.sort((a, b) => a.position - b.position);
                book.markModified('recipe');
            }
            if (book.extraPageData && book.extraPageData.length > 0) {
                book.extraPageData.sort((a, b) => a.position - b.position);
                book.markModified('extraPageData');
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