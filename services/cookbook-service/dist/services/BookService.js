"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const libs_1 = require("@foodie/libs");
const Book_1 = __importDefault(require("../db/Book"));
const Cookbook_1 = __importDefault(require("../db/Cookbook"));
const book_types_1 = require("../Types/book.types");
class BookService {
    async createBook(userId, data, recipeData) {
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
            const bookData = {
                cookbook: new mongoose_1.Types.ObjectId(data.cookbookId),
                layout: data.layout || cookbook.layout || 'single-column',
                sections: data.sections ? data.sections.map(section => ({
                    ...section,
                    lastEditedAt: new Date(),
                })) : [],
                status: book_types_1.BookStatus.DRAFT,
                isPublic: false,
            };
            if (recipeData) {
                bookData.recipe = {
                    basicInfo: recipeData.basicInfo,
                    details: recipeData.details,
                    directions: recipeData.directions,
                    author: recipeData.author,
                };
            }
            const book = new Book_1.default(bookData);
            await book.save();
            cookbook.books.push(book._id);
            await cookbook.save();
            libs_1.logger.info('Book created', {
                bookId: book._id,
                userId,
                cookbookId: data.cookbookId,
                hasRecipe: !!recipeData
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
            const cookbookIds = userCookbooks.map(cb => cb._id);
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
            if (updates.layout !== undefined)
                book.layout = updates.layout;
            if (updates.status !== undefined)
                book.status = updates.status;
            if (updates.isPublic !== undefined)
                book.isPublic = updates.isPublic;
            if (updates.sections !== undefined) {
                updates.sections.forEach(updatedSection => {
                    const existingIndex = book.sections.findIndex(s => s.sectionId === updatedSection.sectionId);
                    if (existingIndex !== -1) {
                        book.sections[existingIndex] = {
                            ...updatedSection,
                            lastEditedAt: new Date(),
                        };
                    }
                    else {
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