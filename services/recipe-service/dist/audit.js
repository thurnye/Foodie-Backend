"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const libs_1 = require("@foodie/libs");
exports.auditLog = {
    recipeCreated: (recipeId, userId, recipeName) => {
        libs_1.logger.info('AUDIT: Recipe Created', {
            event: 'recipe.created',
            recipeId,
            userId,
            recipeName,
            timestamp: new Date().toISOString(),
        });
    },
    recipeUpdated: (recipeId, userId) => {
        libs_1.logger.info('AUDIT: Recipe Updated', {
            event: 'recipe.updated',
            recipeId,
            userId,
            timestamp: new Date().toISOString(),
        });
    },
    recipeDeleted: (recipeId, userId) => {
        libs_1.logger.info('AUDIT: Recipe Deleted', {
            event: 'recipe.deleted',
            recipeId,
            userId,
            timestamp: new Date().toISOString(),
        });
    },
    reviewCreated: (reviewId, recipeId, userId, rating) => {
        libs_1.logger.info('AUDIT: Review Created', {
            event: 'review.created',
            reviewId,
            recipeId,
            userId,
            rating,
            timestamp: new Date().toISOString(),
        });
    },
    cookbookGenerated: (userId, pdfId) => {
        libs_1.logger.info('AUDIT: Cookbook Generated', {
            event: 'cookbook.generated',
            userId,
            pdfId,
            timestamp: new Date().toISOString(),
        });
    },
};
//# sourceMappingURL=audit.js.map