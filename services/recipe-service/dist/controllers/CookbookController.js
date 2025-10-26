"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookbookStatus = exports.generateCookbook = void 0;
const CookbookService_1 = __importDefault(require("../services/CookbookService"));
const libs_1 = require("@foodie/libs");
const generateCookbook = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const authenticatedUserId = req.user?.userId;
        if (authenticatedUserId && authenticatedUserId !== userId) {
            (0, libs_1.fail)(res, 'You can only generate your own cookbook', 403);
            return;
        }
        const cookbook = await CookbookService_1.default.generateCookbook(userId);
        libs_1.logger.info('Cookbook generated', { userId, pdfId: cookbook.pdfId });
        (0, libs_1.success)(res, cookbook, 'Cookbook generated successfully. Note: This is a stub implementation.', undefined, 201);
    }
    catch (error) {
        libs_1.logger.error('Generate cookbook error', { error });
        next(error);
    }
};
exports.generateCookbook = generateCookbook;
const getCookbookStatus = async (req, res, next) => {
    try {
        const { pdfId } = req.params;
        const status = await CookbookService_1.default.getCookbookStatus(pdfId);
        (0, libs_1.success)(res, status, 'Cookbook status retrieved');
    }
    catch (error) {
        libs_1.logger.error('Get cookbook status error', { error });
        next(error);
    }
};
exports.getCookbookStatus = getCookbookStatus;
//# sourceMappingURL=CookbookController.js.map