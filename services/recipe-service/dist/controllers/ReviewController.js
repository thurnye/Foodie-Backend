"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReviewForRecipe = exports.deleteReview = exports.updateReview = exports.getReviewsForRecipe = exports.addReview = void 0;
const ReviewService_1 = __importDefault(require("../services/ReviewService"));
const libs_1 = require("@foodie/libs");
const filters_1 = require("../utils/filters");
const addReview = async (req, res, next) => {
    try {
        const { review, rating, recipeId } = req.body;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Unauthorized', 401);
            return;
        }
        const newReview = await ReviewService_1.default.createReview(userId, recipeId, review, rating);
        libs_1.logger.info('Review added', { reviewId: newReview._id, recipeId, userId });
        (0, libs_1.success)(res, {
            reviewId: newReview._id,
            rating: newReview.rating,
        }, 'Review added successfully', undefined, 201);
    }
    catch (error) {
        libs_1.logger.error('Add review error', { error });
        next(error);
    }
};
exports.addReview = addReview;
const getReviewsForRecipe = async (req, res, next) => {
    try {
        const { recipeId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const { reviews, total } = await ReviewService_1.default.getReviewsByRecipe(recipeId, page, limit);
        const meta = (0, filters_1.getPaginationMeta)(page, limit, total);
        (0, libs_1.success)(res, reviews, 'Reviews retrieved successfully', meta);
    }
    catch (error) {
        libs_1.logger.error('Get reviews error', { error });
        next(error);
    }
};
exports.getReviewsForRecipe = getReviewsForRecipe;
const updateReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user?.userId;
        const updates = req.body;
        if (!userId) {
            (0, libs_1.fail)(res, 'Unauthorized', 401);
            return;
        }
        const review = await ReviewService_1.default.updateReview(reviewId, userId, updates);
        libs_1.logger.info('Review updated', { reviewId, userId });
        (0, libs_1.success)(res, review, 'Review updated successfully');
    }
    catch (error) {
        libs_1.logger.error('Update review error', { error });
        next(error);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Unauthorized', 401);
            return;
        }
        await ReviewService_1.default.deleteReview(reviewId, userId);
        libs_1.logger.info('Review deleted', { reviewId, userId });
        (0, libs_1.success)(res, null, 'Review deleted successfully');
    }
    catch (error) {
        libs_1.logger.error('Delete review error', { error });
        next(error);
    }
};
exports.deleteReview = deleteReview;
const getUserReviewForRecipe = async (req, res, next) => {
    try {
        const { recipeId } = req.params;
        const userId = req.user?.userId;
        if (!userId) {
            (0, libs_1.fail)(res, 'Unauthorized', 401);
            return;
        }
        const review = await ReviewService_1.default.getUserReviewForRecipe(userId, recipeId);
        if (!review) {
            (0, libs_1.success)(res, null, 'No review found');
        }
        (0, libs_1.success)(res, review, 'Review retrieved successfully');
    }
    catch (error) {
        libs_1.logger.error('Get user review error', { error });
        next(error);
    }
};
exports.getUserReviewForRecipe = getUserReviewForRecipe;
//# sourceMappingURL=ReviewController.js.map