"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExtraPage = exports.updateExtraPage = exports.addExtraPage = exports.getCookbookStatus = exports.generateCookbook = exports.deleteCookbook = exports.updateCookbook = exports.getPublicCookbooks = exports.getMyCookbooks = exports.getCookbookById = exports.createCookbook = void 0;
const CookbookService_1 = __importDefault(require("../services/CookbookService"));
const libs_1 = require("@foodie/libs");
const createCookbook = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Authentication required. Please log in to create a cookbook.', 401);
            return;
        }
        const cookbookData = req.body;
        const cookbook = await CookbookService_1.default.createCookbook(userId, cookbookData);
        libs_1.logger.info('Cookbook created', { cookbookId: cookbook._id, userId });
        (0, libs_1.success)(res, {
            cookbookId: cookbook._id,
            title: cookbook.title,
            bookCount: cookbook.books?.length || 0,
            status: cookbook.status,
        }, 'Cookbook created successfully', undefined, 201);
    }
    catch (error) {
        libs_1.logger.error('Create cookbook error', { error });
        next(error);
    }
};
exports.createCookbook = createCookbook;
const getCookbookById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        libs_1.logger.info('Getting cookbook by ID', {
            cookbookId: id,
            userId: userId || 'not authenticated',
            headers: {
                'x-user-id': req.headers['x-user-id'],
                'x-user-email': req.headers['x-user-email']
            }
        });
        const cookbook = await CookbookService_1.default.getCookbookById(id, userId);
        (0, libs_1.success)(res, cookbook, 'Cookbook retrieved successfully');
    }
    catch (error) {
        libs_1.logger.error('Get cookbook error', { error, cookbookId: req.params.id });
        next(error);
    }
};
exports.getCookbookById = getCookbookById;
const getMyCookbooks = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Authentication required', 401);
            return;
        }
        const query = {
            page: req.query.page ? parseInt(req.query.page) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            status: req.query.status,
            isPublic: req.query.isPublic ? req.query.isPublic === 'true' : undefined,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };
        const result = await CookbookService_1.default.getMyCookbooks(userId, query);
        (0, libs_1.success)(res, result.cookbooks, 'Cookbooks retrieved successfully', result.pagination);
    }
    catch (error) {
        libs_1.logger.error('Get my cookbooks error', { error });
        next(error);
    }
};
exports.getMyCookbooks = getMyCookbooks;
const getPublicCookbooks = async (req, res, next) => {
    try {
        const query = {
            page: req.query.page ? parseInt(req.query.page) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
        };
        const result = await CookbookService_1.default.getPublicCookbooks(query);
        (0, libs_1.success)(res, result.cookbooks, 'Public cookbooks retrieved successfully', result.pagination);
    }
    catch (error) {
        libs_1.logger.error('Get public cookbooks error', { error });
        next(error);
    }
};
exports.getPublicCookbooks = getPublicCookbooks;
const updateCookbook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Authentication required', 401);
            return;
        }
        const updates = req.body;
        const cookbook = await CookbookService_1.default.updateCookbook(id, userId, updates);
        libs_1.logger.info('Cookbook updated', { cookbookId: id, userId });
        (0, libs_1.success)(res, {
            cookbookId: cookbook._id,
            title: cookbook.title,
            status: cookbook.status,
        }, 'Cookbook updated successfully');
    }
    catch (error) {
        libs_1.logger.error('Update cookbook error', { error, cookbookId: req.params.id });
        next(error);
    }
};
exports.updateCookbook = updateCookbook;
const deleteCookbook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Authentication required', 401);
            return;
        }
        await CookbookService_1.default.deleteCookbook(id, userId);
        libs_1.logger.info('Cookbook deleted', { cookbookId: id, userId });
        (0, libs_1.success)(res, { cookbookId: id }, 'Cookbook deleted successfully');
    }
    catch (error) {
        libs_1.logger.error('Delete cookbook error', { error, cookbookId: req.params.id });
        next(error);
    }
};
exports.deleteCookbook = deleteCookbook;
const generateCookbook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Authentication required', 401);
            return;
        }
        const cookbook = await CookbookService_1.default.getCookbookById(id, userId);
        if (cookbook.author.toString() !== userId) {
            (0, libs_1.fail)(res, 'You can only generate your own cookbooks', 403);
            return;
        }
        await CookbookService_1.default.updateGenerationStatus(id, 'generating', 0);
        libs_1.logger.info('Cookbook generation initiated', { cookbookId: id, userId });
        (0, libs_1.success)(res, {
            cookbookId: id,
            status: 'generating',
            message: 'Cookbook generation has been initiated',
        }, 'Cookbook generation started successfully');
    }
    catch (error) {
        libs_1.logger.error('Generate cookbook error', { error, cookbookId: req.params.id });
        next(error);
    }
};
exports.generateCookbook = generateCookbook;
const getCookbookStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const cookbook = await CookbookService_1.default.getCookbookById(id, userId);
        (0, libs_1.success)(res, {
            cookbookId: id,
            status: cookbook.status,
            progress: cookbook.generationProgress,
            pdfUrl: cookbook.pdfUrl,
            errorMessage: cookbook.errorMessage,
            lastGeneratedAt: cookbook.lastGeneratedAt,
        }, 'Cookbook status retrieved successfully');
    }
    catch (error) {
        libs_1.logger.error('Get cookbook status error', { error, cookbookId: req.params.id });
        next(error);
    }
};
exports.getCookbookStatus = getCookbookStatus;
const addExtraPage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Authentication required. Please log in to add pages.', 401);
            return;
        }
        const { title, pageType, templateType, section, position } = req.body;
        if (!title || !pageType || !section || position === undefined) {
            (0, libs_1.fail)(res, 'Title, pageType, section, and position are required', 400);
            return;
        }
        const cookbook = await CookbookService_1.default.addExtraPage(id, userId, {
            title,
            pageType,
            templateType,
            section,
            position,
        });
        (0, libs_1.success)(res, cookbook, 'Extra page added successfully', 201);
    }
    catch (error) {
        libs_1.logger.error('Add extra page error', { error, cookbookId: req.params.id });
        next(error);
    }
};
exports.addExtraPage = addExtraPage;
const updateExtraPage = async (req, res, next) => {
    try {
        const { id, pageId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Authentication required. Please log in to update pages.', 401);
            return;
        }
        const updates = req.body;
        const cookbook = await CookbookService_1.default.updateExtraPage(id, pageId, userId, updates);
        (0, libs_1.success)(res, cookbook, 'Extra page updated successfully');
    }
    catch (error) {
        libs_1.logger.error('Update extra page error', { error, cookbookId: req.params.id });
        next(error);
    }
};
exports.updateExtraPage = updateExtraPage;
const deleteExtraPage = async (req, res, next) => {
    try {
        const { id, pageId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Authentication required. Please log in to delete pages.', 401);
            return;
        }
        const cookbook = await CookbookService_1.default.deleteExtraPage(id, pageId, userId);
        (0, libs_1.success)(res, cookbook, 'Extra page deleted successfully');
    }
    catch (error) {
        libs_1.logger.error('Delete extra page error', { error, cookbookId: req.params.id });
        next(error);
    }
};
exports.deleteExtraPage = deleteExtraPage;
//# sourceMappingURL=CookbookController.js.map