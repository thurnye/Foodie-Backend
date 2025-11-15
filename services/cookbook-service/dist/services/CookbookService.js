"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookbook_types_1 = require("../Types/cookbook.types");
const mongoose_1 = require("mongoose");
const libs_1 = require("@foodie/libs");
const Cookbook_1 = __importDefault(require("../db/Cookbook"));
const userClient_1 = require("../utils/userClient");
class CookbookService {
    async createCookbook(userId, data) {
        try {
            const cookbook = new Cookbook_1.default({
                author: new mongoose_1.Types.ObjectId(userId),
                title: data.title,
                description: data.description,
                books: [],
                theme: data.theme || cookbook_types_1.CookbookTheme.MODERN,
                layout: data.layout || cookbook_types_1.CookbookLayout.SINGLE_COLUMN,
                coverImage: data.coverImage,
                customColors: data.customColors,
                authorBio: data.authorBio,
                authorImage: data.authorImage,
                isPublic: data.isPublic || false,
                status: cookbook_types_1.CookbookStatus.DRAFT,
            });
            await cookbook.save();
            libs_1.logger.info('Cookbook created', { cookbookId: cookbook._id, userId });
            return cookbook;
        }
        catch (error) {
            libs_1.logger.error('Error creating cookbook', { error, userId });
            throw error;
        }
    }
    async getCookbookById(cookbookId, userId) {
        try {
            const cookbook = await Cookbook_1.default.findOne({
                _id: cookbookId,
                isActive: true,
            }).populate({
                path: 'books',
                match: { isActive: true },
            });
            if (!cookbook) {
                throw libs_1.Errors.notFound('Cookbook not found');
            }
            if (userId) {
                const isAuthor = cookbook.author.toString() === userId;
                if (!isAuthor && !cookbook.isPublic) {
                    throw libs_1.Errors.forbidden('You do not have permission to access this cookbook');
                }
            }
            else if (!cookbook.isPublic) {
                throw libs_1.Errors.forbidden('This cookbook is private');
            }
            const authorData = await (0, userClient_1.fetchUserData)(cookbook.author.toString());
            const cookbookObj = cookbook.toObject();
            if (authorData) {
                cookbookObj.author = authorData;
            }
            libs_1.logger.info('Cookbook retrieved', {
                cookbookId: cookbook._id,
                bookCount: cookbook.books?.length || 0,
                authorPopulated: !!authorData,
            });
            return cookbookObj;
        }
        catch (error) {
            libs_1.logger.error('Error fetching cookbook', { error, cookbookId });
            throw error;
        }
    }
    async getMyCookbooks(userId, query = {}) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;
            const sortBy = query.sortBy || 'createdAt';
            const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
            const filter = {
                author: userId,
                isActive: true,
            };
            if (query.status) {
                filter.status = query.status;
            }
            if (query.isPublic !== undefined) {
                filter.isPublic = query.isPublic;
            }
            const totalCookbooks = await Cookbook_1.default.countDocuments(filter);
            const cookbooks = await Cookbook_1.default.find(filter)
                .populate({
                path: 'books',
                match: { isActive: true },
            })
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit);
            const cookbooksWithAuthors = await Promise.all(cookbooks.map(async (cookbook) => {
                const cookbookObj = cookbook.toObject();
                const authorData = await (0, userClient_1.fetchUserData)(cookbook.author.toString());
                if (authorData) {
                    cookbookObj.author = authorData;
                }
                return cookbookObj;
            }));
            return {
                cookbooks: cookbooksWithAuthors,
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(totalCookbooks / limit),
                    totalCookbooks,
                },
            };
        }
        catch (error) {
            libs_1.logger.error('Error fetching user cookbooks', { error, userId });
            throw error;
        }
    }
    async getPublicCookbooks(query = {}) {
        try {
            const page = query.page || 1;
            const limit = query.limit || 10;
            const skip = (page - 1) * limit;
            const sortBy = query.sortBy || 'createdAt';
            const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
            const filter = {
                isPublic: true,
                isActive: true,
                status: cookbook_types_1.CookbookStatus.COMPLETED,
            };
            const totalCookbooks = await Cookbook_1.default.countDocuments(filter);
            const cookbooks = await Cookbook_1.default.find(filter)
                .populate({
                path: 'books',
                match: { isActive: true, isPublic: true },
            })
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit);
            const cookbooksWithAuthors = await Promise.all(cookbooks.map(async (cookbook) => {
                const cookbookObj = cookbook.toObject();
                const authorData = await (0, userClient_1.fetchUserData)(cookbook.author.toString());
                if (authorData) {
                    cookbookObj.author = authorData;
                }
                return cookbookObj;
            }));
            return {
                cookbooks: cookbooksWithAuthors,
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(totalCookbooks / limit),
                    totalCookbooks,
                },
            };
        }
        catch (error) {
            libs_1.logger.error('Error fetching public cookbooks', { error });
            throw error;
        }
    }
    async updateCookbook(cookbookId, userId, updates) {
        try {
            const cookbook = await Cookbook_1.default.findOne({
                _id: cookbookId,
                isActive: true,
            });
            if (!cookbook) {
                throw libs_1.Errors.notFound('Cookbook not found');
            }
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only update your own cookbooks');
            }
            if (cookbook.status === cookbook_types_1.CookbookStatus.GENERATING) {
                throw libs_1.Errors.badRequest('Cannot update cookbook while it is being generated');
            }
            if (updates.title !== undefined)
                cookbook.title = updates.title;
            if (updates.description !== undefined)
                cookbook.description = updates.description;
            if (updates.theme !== undefined)
                cookbook.theme = updates.theme;
            if (updates.layout !== undefined)
                cookbook.layout = updates.layout;
            if (updates.coverImage !== undefined)
                cookbook.coverImage = updates.coverImage;
            if (updates.customColors !== undefined)
                cookbook.customColors = updates.customColors;
            if (updates.authorBio !== undefined)
                cookbook.authorBio = updates.authorBio;
            if (updates.authorImage !== undefined)
                cookbook.authorImage = updates.authorImage;
            if (updates.isPublic !== undefined)
                cookbook.isPublic = updates.isPublic;
            if (updates.theme || updates.layout) {
                cookbook.status = cookbook_types_1.CookbookStatus.DRAFT;
                cookbook.pdfUrl = undefined;
                cookbook.generationProgress = 0;
            }
            await cookbook.save();
            libs_1.logger.info('Cookbook updated', { cookbookId, userId });
            return cookbook;
        }
        catch (error) {
            libs_1.logger.error('Error updating cookbook', { error, cookbookId });
            throw error;
        }
    }
    async deleteCookbook(cookbookId, userId) {
        try {
            const cookbook = await Cookbook_1.default.findOne({
                _id: cookbookId,
                isActive: true,
            });
            if (!cookbook) {
                throw libs_1.Errors.notFound('Cookbook not found');
            }
            if (cookbook.author.toString() !== userId) {
                throw libs_1.Errors.forbidden('You can only delete your own cookbooks');
            }
            cookbook.isActive = false;
            await cookbook.save();
            libs_1.logger.info('Cookbook deleted', { cookbookId, userId });
        }
        catch (error) {
            libs_1.logger.error('Error deleting cookbook', { error, cookbookId });
            throw error;
        }
    }
    async updateGenerationStatus(cookbookId, status, progress, pdfUrl, errorMessage, pageCount, fileSize) {
        try {
            const cookbook = await Cookbook_1.default.findOne({
                _id: cookbookId,
                isActive: true,
            });
            if (!cookbook) {
                throw libs_1.Errors.notFound('Cookbook not found');
            }
            cookbook.status = status;
            if (progress !== undefined) {
                cookbook.generationProgress = progress;
            }
            if (pdfUrl) {
                cookbook.pdfUrl = pdfUrl;
                cookbook.lastGeneratedAt = new Date();
            }
            if (errorMessage) {
                cookbook.errorMessage = errorMessage;
            }
            if (pageCount) {
                cookbook.pageCount = pageCount;
            }
            if (fileSize) {
                cookbook.fileSize = fileSize;
            }
            await cookbook.save();
            libs_1.logger.info('Cookbook generation status updated', {
                cookbookId,
                status,
                progress,
            });
            return cookbook;
        }
        catch (error) {
            libs_1.logger.error('Error updating generation status', { error, cookbookId });
            throw error;
        }
    }
}
exports.default = new CookbookService();
//# sourceMappingURL=CookbookService.js.map