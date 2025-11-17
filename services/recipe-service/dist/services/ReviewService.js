"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const Review_1 = __importDefault(require("../db/Review"));
const ReviewReply_1 = __importDefault(require("../db/ReviewReply"));
const RecipeService_1 = __importDefault(require("./RecipeService"));
const libs_1 = require("@foodie/libs");
const userClient_1 = require("../utils/userClient");
class ReviewService {
    async createReview(userId, recipeId, reviewText, rating) {
        const existingReview = await Review_1.default.findOne({ userId, recipeId });
        if (existingReview) {
            throw libs_1.Errors.conflict('You have already reviewed this recipe. Please update your existing review instead.');
        }
        const review = await Review_1.default.create({
            review: reviewText,
            rating,
            userId,
            recipeId,
        });
        await RecipeService_1.default.addReviewToRecipe(recipeId, review._id.toString());
        await this.updateRecipeAverageRating(recipeId);
        return review;
    }
    async getReviewsByRecipe(recipeId, page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            Review_1.default.find({ recipeId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review_1.default.countDocuments({ recipeId }),
        ]);
        return { reviews: reviews, total };
    }
    async updateReview(reviewId, userId, updates) {
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            throw libs_1.Errors.notFound('Review not found');
        }
        if (review.userId.toString() !== userId) {
            throw libs_1.Errors.forbidden('You can only update your own reviews');
        }
        if (updates.review)
            review.review = updates.review;
        if (updates.rating)
            review.rating = updates.rating;
        await review.save();
        if (updates.rating) {
            await this.updateRecipeAverageRating(review.recipeId.toString());
        }
        return review;
    }
    async deleteReview(reviewId, userId) {
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            throw libs_1.Errors.notFound('Review not found');
        }
        if (review.userId.toString() !== userId) {
            throw libs_1.Errors.forbidden('You can only delete your own reviews');
        }
        const recipeId = review.recipeId.toString();
        await Review_1.default.findByIdAndDelete(reviewId);
        await this.updateRecipeAverageRating(recipeId);
    }
    async updateRecipeAverageRating(recipeId) {
        const result = await Review_1.default.aggregate([
            { $match: { recipeId: recipeId } },
            {
                $group: {
                    _id: '$recipeId',
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);
        if (result.length > 0) {
            const { averageRating, totalReviews } = result[0];
            await RecipeService_1.default.updateRecipeRating(recipeId, Math.round(averageRating * 10) / 10, totalReviews);
        }
        else {
            await RecipeService_1.default.updateRecipeRating(recipeId, 0, 0);
        }
    }
    async getUserReviewForRecipe(userId, recipeId) {
        return Review_1.default.findOne({
            userId,
            recipeId,
        }).lean();
    }
    async toggleReviewLike(reviewId, userId) {
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            throw libs_1.Errors.notFound('Review not found');
        }
        const userIdObj = userId;
        const isLiked = review.likes.some((id) => id.toString() === userId);
        if (isLiked) {
            review.likes = review.likes.filter((id) => id.toString() !== userId);
        }
        else {
            review.likes.push(userIdObj);
        }
        await review.save();
        return review;
    }
    async toggleReviewReaction(reviewId, userId, reactionType) {
        const review = await Review_1.default.findById(reviewId);
        if (!review) {
            throw libs_1.Errors.notFound('Review not found');
        }
        const userIdObj = userId;
        const existingReactionIndex = review.reactions.findIndex((r) => r.userId.toString() === userId && r.type === reactionType);
        if (existingReactionIndex > -1) {
            review.reactions.splice(existingReactionIndex, 1);
        }
        else {
            review.reactions = review.reactions.filter((r) => r.userId.toString() !== userId);
            review.reactions.push({ type: reactionType, userId: userIdObj });
        }
        await review.save();
        return review;
    }
    async createReply(userId, parentReviewId, reviewText, parentReplyId) {
        const parentReview = await Review_1.default.findById(parentReviewId);
        if (!parentReview) {
            throw libs_1.Errors.notFound('Parent review not found');
        }
        if (parentReplyId) {
            const parentReply = await ReviewReply_1.default.findById(parentReplyId);
            if (!parentReply) {
                throw libs_1.Errors.notFound('Parent reply not found');
            }
        }
        const reply = await ReviewReply_1.default.create({
            review: reviewText,
            userId,
            parentReviewId,
            parentReplyId,
            likes: [],
            reactions: [],
        });
        return reply;
    }
    async getRepliesByReview(parentReviewId) {
        const replies = await ReviewReply_1.default.find({ parentReviewId })
            .sort({ createdAt: 1 })
            .lean();
        return replies;
    }
    async toggleReplyLike(replyId, userId) {
        const reply = await ReviewReply_1.default.findById(replyId);
        if (!reply) {
            throw libs_1.Errors.notFound('Reply not found');
        }
        const userIdObj = userId;
        const isLiked = reply.likes.some((id) => id.toString() === userId);
        if (isLiked) {
            reply.likes = reply.likes.filter((id) => id.toString() !== userId);
        }
        else {
            reply.likes.push(userIdObj);
        }
        await reply.save();
        return reply;
    }
    async toggleReplyReaction(replyId, userId, reactionType) {
        const reply = await ReviewReply_1.default.findById(replyId);
        if (!reply) {
            throw libs_1.Errors.notFound('Reply not found');
        }
        const userIdObj = userId;
        const existingReactionIndex = reply.reactions.findIndex((r) => r.userId.toString() === userId && r.type === reactionType);
        if (existingReactionIndex > -1) {
            reply.reactions.splice(existingReactionIndex, 1);
        }
        else {
            reply.reactions = reply.reactions.filter((r) => r.userId.toString() !== userId);
            reply.reactions.push({ type: reactionType, userId: userIdObj });
        }
        await reply.save();
        return reply;
    }
    async getReviewsWithReplies(recipeId, page = 1, limit = 12) {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            Review_1.default.find({ recipeId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review_1.default.countDocuments({ recipeId }),
        ]);
        const reviewIds = reviews.map((r) => r._id);
        const replies = await ReviewReply_1.default.find({
            parentReviewId: { $in: reviewIds },
        })
            .sort({ createdAt: 1 })
            .lean();
        const userIds = [
            ...new Set([
                ...reviews.map((r) => r.userId.toString()),
                ...replies.map((r) => r.userId.toString()),
            ]),
        ];
        const userMap = await (0, userClient_1.fetchUsersData)(userIds);
        const repliesMap = new Map();
        for (const reply of replies) {
            const parentId = reply.parentReviewId.toString();
            if (!repliesMap.has(parentId)) {
                repliesMap.set(parentId, []);
            }
            repliesMap.get(parentId).push({
                ...reply,
                user: userMap.get(reply.userId.toString()),
            });
        }
        const reviewsWithReplies = reviews.map((review) => ({
            ...review,
            user: userMap.get(review.userId.toString()),
            replies: repliesMap.get(review._id.toString()) || [],
        }));
        return { reviews: reviewsWithReplies, total };
    }
}
exports.ReviewService = ReviewService;
exports.default = new ReviewService();
//# sourceMappingURL=ReviewService.js.map