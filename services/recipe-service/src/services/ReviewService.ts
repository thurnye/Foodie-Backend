import Review, { IReview } from '../db/Review';
import ReviewReply, { IReviewReply } from '../db/ReviewReply';
import RecipeService from './RecipeService';
import { Errors } from '@foodie/libs';
import { fetchUsersData } from '../utils/userClient';

/**
 * Review Service - Business logic for review operations
 */
export class ReviewService {
  /**
   * Create a new review
   */
  async createReview(
    userId: string,
    recipeId: string,
    reviewText: string,
    rating: number
  ): Promise<IReview> {
    // Check if user already reviewed this recipe
    const existingReview = await Review.findOne({ userId, recipeId });
    if (existingReview) {
      throw Errors.conflict(
        'You have already reviewed this recipe. Please update your existing review instead.'
      );
    }

    // Create review
    const review = await Review.create({
      review: reviewText,
      rating,
      userId,
      recipeId,
    });

    // Add review reference to recipe
    await RecipeService.addReviewToRecipe(recipeId, review._id.toString());

    // Recalculate and update recipe average rating
    await this.updateRecipeAverageRating(recipeId);

    return review;
  }

  /**
   * Get reviews for a recipe
   */
  async getReviewsByRecipe(
    recipeId: string,
    page = 1,
    limit = 12
  ): Promise<{ reviews: IReview[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ recipeId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ recipeId }),
    ]);

    return { reviews: reviews as unknown as IReview[], total };
  }

  /**
   * Update review
   */
  async updateReview(
    reviewId: string,
    userId: string,
    updates: Partial<IReview>
  ): Promise<IReview> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw Errors.notFound('Review not found');
    }

    // Check if user is the review author
    if (review.userId.toString() !== userId) {
      throw Errors.forbidden('You can only update your own reviews');
    }

    // Update review
    if (updates.review) review.review = updates.review;
    if (updates.rating) review.rating = updates.rating;

    await review.save();

    // Recalculate recipe average rating if rating changed
    if (updates.rating) {
      await this.updateRecipeAverageRating(review.recipeId.toString());
    }

    return review;
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await Review.findById(reviewId);

    if (!review) {
      throw Errors.notFound('Review not found');
    }

    // Check if user is the review author
    if (review.userId.toString() !== userId) {
      throw Errors.forbidden('You can only delete your own reviews');
    }

    const recipeId = review.recipeId.toString();
    await Review.findByIdAndDelete(reviewId);

    // Recalculate recipe average rating
    await this.updateRecipeAverageRating(recipeId);
  }

  /**
   * Calculate and update recipe average rating
   */
  async updateRecipeAverageRating(recipeId: string): Promise<void> {
    const result = await Review.aggregate([
      { $match: { recipeId: recipeId as any } },
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
      await RecipeService.updateRecipeRating(
        recipeId,
        Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews
      );
    } else {
      // No reviews, reset to defaults
      await RecipeService.updateRecipeRating(recipeId, 0, 0);
    }
  }

  /**
   * Get user's review for a recipe
   */
  async getUserReviewForRecipe(
    userId: string,
    recipeId: string
  ): Promise<IReview | null> {
    return Review.findOne({
      userId,
      recipeId,
    }).lean() as unknown as IReview | null;
  }

  /**
   * Like/Unlike a review
   */
  async toggleReviewLike(reviewId: string, userId: string): Promise<IReview> {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw Errors.notFound('Review not found');
    }

    const userIdObj = userId as any;
    const isLiked = review.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      review.likes = review.likes.filter((id) => id.toString() !== userId);
    } else {
      review.likes.push(userIdObj);
    }

    await review.save();
    return review;
  }

  /**
   * Add/Remove reaction to a review
   */
  async toggleReviewReaction(
    reviewId: string,
    userId: string,
    reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
  ): Promise<IReview> {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw Errors.notFound('Review not found');
    }

    const userIdObj = userId as any;
    const existingReactionIndex = review.reactions.findIndex(
      (r) => r.userId.toString() === userId && r.type === reactionType
    );

    if (existingReactionIndex > -1) {
      // Remove the reaction
      review.reactions.splice(existingReactionIndex, 1);
    } else {
      // Remove any other reaction from this user first
      review.reactions = review.reactions.filter(
        (r) => r.userId.toString() !== userId
      );
      // Add new reaction
      review.reactions.push({ type: reactionType, userId: userIdObj });
    }

    await review.save();
    return review;
  }

  /**
   * Create a reply to a review
   */
  async createReply(
    userId: string,
    parentReviewId: string,
    reviewText: string,
    parentReplyId?: string
  ): Promise<IReviewReply> {
    // Verify parent review exists
    const parentReview = await Review.findById(parentReviewId);
    if (!parentReview) {
      throw Errors.notFound('Parent review not found');
    }

    // If replying to a reply, verify it exists
    if (parentReplyId) {
      const parentReply = await ReviewReply.findById(parentReplyId);
      if (!parentReply) {
        throw Errors.notFound('Parent reply not found');
      }
    }

    const reply = await ReviewReply.create({
      review: reviewText,
      userId,
      parentReviewId,
      parentReplyId,
      likes: [],
      reactions: [],
    });

    return reply;
  }

  /**
   * Get replies for a review
   */
  async getRepliesByReview(parentReviewId: string): Promise<IReviewReply[]> {
    const replies = await ReviewReply.find({ parentReviewId })
      .sort({ createdAt: 1 })
      .lean();

    return replies as unknown as IReviewReply[];
  }

  /**
   * Like/Unlike a reply
   */
  async toggleReplyLike(replyId: string, userId: string): Promise<IReviewReply> {
    const reply = await ReviewReply.findById(replyId);
    if (!reply) {
      throw Errors.notFound('Reply not found');
    }

    const userIdObj = userId as any;
    const isLiked = reply.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      reply.likes = reply.likes.filter((id) => id.toString() !== userId);
    } else {
      reply.likes.push(userIdObj);
    }

    await reply.save();
    return reply;
  }

  /**
   * Add/Remove reaction to a reply
   */
  async toggleReplyReaction(
    replyId: string,
    userId: string,
    reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
  ): Promise<IReviewReply> {
    const reply = await ReviewReply.findById(replyId);
    if (!reply) {
      throw Errors.notFound('Reply not found');
    }

    const userIdObj = userId as any;
    const existingReactionIndex = reply.reactions.findIndex(
      (r) => r.userId.toString() === userId && r.type === reactionType
    );

    if (existingReactionIndex > -1) {
      reply.reactions.splice(existingReactionIndex, 1);
    } else {
      reply.reactions = reply.reactions.filter(
        (r) => r.userId.toString() !== userId
      );
      reply.reactions.push({ type: reactionType, userId: userIdObj });
    }

    await reply.save();
    return reply;
  }

  /**
   * Get reviews with replies and user data
   */
  async getReviewsWithReplies(
    recipeId: string,
    page = 1,
    limit = 12
  ): Promise<{ reviews: any[]; total: number }> {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ recipeId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ recipeId }),
    ]);

    // Get all replies for these reviews
    const reviewIds = reviews.map((r) => r._id);
    const replies = await ReviewReply.find({
      parentReviewId: { $in: reviewIds },
    })
      .sort({ createdAt: 1 })
      .lean();

    // Get all unique user IDs
    const userIds = [
      ...new Set([
        ...reviews.map((r) => r.userId.toString()),
        ...replies.map((r) => r.userId.toString()),
      ]),
    ];

    // Fetch user data
    const userMap = await fetchUsersData(userIds);

    // Group replies by parent review
    const repliesMap = new Map<string, any[]>();
    for (const reply of replies) {
      const parentId = reply.parentReviewId.toString();
      if (!repliesMap.has(parentId)) {
        repliesMap.set(parentId, []);
      }
      repliesMap.get(parentId)!.push({
        ...reply,
        user: userMap.get(reply.userId.toString()),
      });
    }

    // Combine reviews with their replies and user data
    const reviewsWithReplies = reviews.map((review) => ({
      ...review,
      user: userMap.get(review.userId.toString()),
      replies: repliesMap.get(review._id.toString()) || [],
    }));

    return { reviews: reviewsWithReplies, total };
  }
}

export default new ReviewService();
