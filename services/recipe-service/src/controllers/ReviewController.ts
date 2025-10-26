import { Request, Response, NextFunction } from 'express';
import ReviewService from '../services/ReviewService';
import { success, fail, logger } from '@foodie/libs';
import { getPaginationMeta } from '../utils/filters';

/**
 * Add review to recipe
 */
export const addReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { review, rating, recipeId } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const newReview = await ReviewService.createReview(userId, recipeId, review, rating);

    logger.info('Review added', { reviewId: newReview._id, recipeId, userId });

    success(
      res,
      {
        reviewId: newReview._id,
        rating: newReview.rating,
      },
      'Review added successfully',
      undefined,
      201
    );
  } catch (error) {
    logger.error('Add review error', { error });
    next(error);
  }
};

/**
 * Get reviews for a recipe
 */
export const getReviewsForRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const { reviews, total } = await ReviewService.getReviewsByRecipe(recipeId, page, limit);

    const meta = getPaginationMeta(page, limit, total);

    success(res, reviews, 'Reviews retrieved successfully', meta);
  } catch (error) {
    logger.error('Get reviews error', { error });
    next(error);
  }
};

/**
 * Update review
 */
export const updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user?.userId;
    const updates = req.body;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const review = await ReviewService.updateReview(reviewId, userId, updates);

    logger.info('Review updated', { reviewId, userId });

    success(res, review, 'Review updated successfully');
  } catch (error) {
    logger.error('Update review error', { error });
    next(error);
  }
};

/**
 * Delete review
 */
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    await ReviewService.deleteReview(reviewId, userId);

    logger.info('Review deleted', { reviewId, userId });

    success(res, null, 'Review deleted successfully');
  } catch (error) {
    logger.error('Delete review error', { error });
    next(error);
  }
};

/**
 * Get user's review for a specific recipe
 */
export const getUserReviewForRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const review = await ReviewService.getUserReviewForRecipe(userId, recipeId);

    if (!review) {
      success(res, null, 'No review found');
    }

    success(res, review, 'Review retrieved successfully');
  } catch (error) {
    logger.error('Get user review error', { error });
    next(error);
  }
};

/**
 * Get reviews with replies for a recipe
 */
export const getReviewsWithReplies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recipeId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const { reviews, total } = await ReviewService.getReviewsWithReplies(recipeId, page, limit);

    const meta = getPaginationMeta(page, limit, total);

    success(res, reviews, 'Reviews retrieved successfully', meta);
  } catch (error) {
    logger.error('Get reviews with replies error', { error });
    next(error);
  }
};

/**
 * Toggle like on a review
 */
export const toggleReviewLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const review = await ReviewService.toggleReviewLike(reviewId, userId);

    success(res, review, 'Review like toggled successfully');
  } catch (error) {
    logger.error('Toggle review like error', { error });
    next(error);
  }
};

/**
 * Toggle reaction on a review
 */
export const toggleReviewReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { reviewId } = req.params;
    const { reactionType } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const review = await ReviewService.toggleReviewReaction(reviewId, userId, reactionType);

    success(res, review, 'Review reaction toggled successfully');
  } catch (error) {
    logger.error('Toggle review reaction error', { error });
    next(error);
  }
};

/**
 * Create a reply to a review
 */
export const createReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { parentReviewId, parentReplyId, review } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const reply = await ReviewService.createReply(userId, parentReviewId, review, parentReplyId);

    logger.info('Reply created', { replyId: reply._id, parentReviewId, userId });

    success(res, reply, 'Reply created successfully', undefined, 201);
  } catch (error) {
    logger.error('Create reply error', { error });
    next(error);
  }
};

/**
 * Toggle like on a reply
 */
export const toggleReplyLike = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { replyId } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const reply = await ReviewService.toggleReplyLike(replyId, userId);

    success(res, reply, 'Reply like toggled successfully');
  } catch (error) {
    logger.error('Toggle reply like error', { error });
    next(error);
  }
};

/**
 * Toggle reaction on a reply
 */
export const toggleReplyReaction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { replyId } = req.params;
    const { reactionType } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const reply = await ReviewService.toggleReplyReaction(replyId, userId, reactionType);

    success(res, reply, 'Reply reaction toggled successfully');
  } catch (error) {
    logger.error('Toggle reply reaction error', { error });
    next(error);
  }
};
