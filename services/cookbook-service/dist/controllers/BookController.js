"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const libs_1 = require("@foodie/libs");
const BookService_1 = __importDefault(require("../services/BookService"));
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
            const { cookbookId, layout, sections, recipeData } = req.body;
            if (!cookbookId) {
                res.status(400).json({
                    success: false,
                    message: 'Cookbook ID is required',
                });
                return;
            }
            const book = await BookService_1.default.createBook(userId, {
                cookbookId,
                layout,
                sections,
            }, recipeData);
            res.status(201).json({
                success: true,
                data: book,
                message: 'Book created successfully',
            });
        }
        catch (error) {
            libs_1.logger.error('Create book error', { error });
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to create book',
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
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required. Please log in to update this book.',
                });
                return;
            }
            const updates = req.body;
            const book = await BookService_1.default.updateBook(bookId, userId, updates);
            res.status(200).json({
                success: true,
                data: book,
                message: 'Book updated successfully',
            });
        }
        catch (error) {
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
}
exports.default = new BookController();
//# sourceMappingURL=BookController.js.map