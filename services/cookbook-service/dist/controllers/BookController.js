"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("@foodie/libs");
const BookService_1 = __importDefault(require("../services/BookService"));
const PdfGenerationService_1 = __importDefault(require("../services/PdfGenerationService"));
class BookController {
    async createBook(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in to create a book.',
                });
                return;
            }
            const { bookId, name, description, cookbookId, sections, recipeIds } = req.body;
            // console.log('📥 CREATE/UPDATE BOOK REQUEST:', req.body);
            if (!cookbookId) {
                res.status(400).json({
                    success: false,
                    message: 'Cookbook ID is required to create a new book',
                });
                return;
            }
            // console.log('📘 Creating new book for cookbook:', cookbookId);
            const book = await BookService_1.default.createBook(userId, {
                bookId,
                name,
                description,
                cookbookId,
                sections,
                recipeIds,
            });
            const message = bookId
                ? 'Book updated successfully with new recipes'
                : 'Book created successfully';
            res.status(bookId ? 200 : 201).json({
                success: true,
                data: book,
                message,
            });
        }
        catch (error) {
            libs_1.logger.error('Create/Update book error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to create/update book',
            });
        }
    }
    async getBookById(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
            const book = await BookService_1.default.getBookById(bookId, userId);
            res.status(200).json({
                success: true,
                data: book,
            });
        }
        catch (error) {
            libs_1.logger.error('Get book error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get book',
            });
        }
    }
    async getBookForRendering(req, res) {
        const { bookId } = req.params;
        try {
            const book = await BookService_1.default.getBookByIdWithoutAuth(bookId);
            res.status(200).json({
                success: true,
                data: book,
            });
        }
        catch (error) {
            libs_1.logger.error('Get book for rendering error', { error, bookId });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get book for rendering',
            });
        }
    }
    async getMyBooks(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in to view your books.',
                });
                return;
            }
            const { page, limit, status, isPublic, cookbookId } = req.query;
            const result = await BookService_1.default.getMyBooks(userId, {
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
                status: status,
                isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
                cookbookId: cookbookId,
            });
            res.status(200).json({
                success: true,
                data: result.books,
                pagination: result.pagination,
            });
        }
        catch (error) {
            libs_1.logger.error('Get my books error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get books',
            });
        }
    }
    async updateBook(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
            // console.log('📥 UPDATE BOOK REQUEST:', {
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
            const book = await BookService_1.default.updateBook(bookId, userId, updates);
            // console.log('✅ BOOK UPDATED SUCCESSFULLY:', {
                bookId,
                updatedLayout: book.layout,
            });
            res.status(200).json({
                success: true,
                data: book,
                message: 'Book updated successfully',
            });
        }
        catch (error) {
            console.error('❌ UPDATE BOOK ERROR:', error);
            libs_1.logger.error('Update book error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to update book',
            });
        }
    }
    async deleteBook(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in to delete this book.',
                });
                return;
            }
            await BookService_1.default.deleteBook(bookId, userId);
            res.status(200).json({
                success: true,
                message: 'Book deleted successfully',
            });
        }
        catch (error) {
            libs_1.logger.error('Delete book error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to delete book',
            });
        }
    }
    async addPage(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
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
            const book = await BookService_1.default.addPage(bookId, userId, pageData);
            res.status(201).json({
                success: true,
                data: book,
                message: 'Page added successfully',
            });
        }
        catch (error) {
            libs_1.logger.error('Add page error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to add page',
            });
        }
    }
    async updatePage(req, res) {
        try {
            const { bookId, pageId } = req.params;
            const userId = req.user?.userId;
            // console.log('📥 UPDATE PAGE REQUEST:', {
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
            const book = await BookService_1.default.updatePage(bookId, pageId, userId, updates);
            const updatedRecipe = book.recipe?.find((r) => r.pageId === pageId);
            const updatedExtraPage = book.extraPageData?.find((p) => p.pageId === pageId);
            const updatedPage = updatedRecipe ||
                (book.coverData?.pageId === pageId ? book.coverData : null) ||
                (book.introData?.pageId === pageId ? book.introData : null) ||
                updatedExtraPage;
            // console.log('✅ PAGE UPDATED SUCCESSFULLY:', {
                bookId,
                pageId,
                updatedLayout: updatedPage?.layout,
                pageExists: !!updatedPage,
                totalRecipes: book.recipe?.length || 0,
                allRecipeLayouts: book.recipe?.map((r) => ({ pageId: r.pageId, layout: r.layout })) || [],
            });
            res.status(200).json({
                success: true,
                data: book,
                message: 'Page updated successfully',
            });
        }
        catch (error) {
            console.error('❌ UPDATE PAGE ERROR:', error);
            libs_1.logger.error('Update page error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to update page',
            });
        }
    }
    async deletePage(req, res) {
        try {
            const { bookId, pageId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in to delete pages.',
                });
                return;
            }
            const book = await BookService_1.default.deletePage(bookId, pageId, userId);
            res.status(200).json({
                success: true,
                data: book,
                message: 'Page deleted successfully',
            });
        }
        catch (error) {
            libs_1.logger.error('Delete page error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to delete page',
            });
        }
    }
    async reorderPages(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
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
            const book = await BookService_1.default.reorderPages(bookId, userId, pageOrder);
            res.status(200).json({
                success: true,
                data: book,
                message: 'Pages reordered successfully',
            });
        }
        catch (error) {
            libs_1.logger.error('Reorder pages error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to reorder pages',
            });
        }
    }
    async publishBook(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in to publish this book.',
                });
                return;
            }
            const book = await BookService_1.default.publishBook(bookId, userId);
            res.status(200).json({
                success: true,
                data: book,
                message: 'Book published successfully',
            });
        }
        catch (error) {
            libs_1.logger.error('Publish book error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to publish book',
            });
        }
    }
    async getGenerationStatus(req, res) {
        try {
            const { bookId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required.',
                });
                return;
            }
            const status = PdfGenerationService_1.default.getGenerationStatus(bookId);
            res.status(200).json({
                success: true,
                data: status,
            });
        }
        catch (error) {
            libs_1.logger.error('Get generation status error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get generation status',
            });
        }
    }
}
exports.default = new BookController();
//# sourceMappingURL=BookController.js.map