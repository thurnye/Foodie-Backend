'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ReviewService = void 0;
const Review_1 = __importDefault(require('../db/Review'));
const RecipeService_1 = __importDefault(require('./RecipeService'));
const libs_1 = require('@foodie/libs');
class ReviewService {
  async createReview(userId, recipeId, reviewText, rating) {
    const existingReview = await Review_1.default.findOne({ userId, recipeId });
    if (existingReview) {
      throw libs_1.Errors.conflict(
        'You have already reviewed this recipe. Please update your existing review instead.'
      );
    }
    const review = await Review_1.default.create({
      review: reviewText,
      rating,
      userId,
      recipeId,
    });
    await RecipeService_1.default.addReviewToRecipe(
      recipeId,
      review._id.toString()
    );
    await this.updateRecipeAverageRating(recipeId);
    return review;
  }
  async getReviewsByRecipe(recipeId, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      Review_1.default
        .find({ recipeId })
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
    if (updates.review) review.review = updates.review;
    if (updates.rating) review.rating = updates.rating;
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
      await RecipeService_1.default.updateRecipeRating(
        recipeId,
        Math.round(averageRating * 10) / 10,
        totalReviews
      );
    } else {
      await RecipeService_1.default.updateRecipeRating(recipeId, 0, 0);
    }
  }
  async getUserReviewForRecipe(userId, recipeId) {
    return Review_1.default.findOne({ userId, recipeId }).lean();
  }
}
exports.ReviewService = ReviewService;
exports.default = new ReviewService();
//# sourceMappingURL=ReviewService.js.map
