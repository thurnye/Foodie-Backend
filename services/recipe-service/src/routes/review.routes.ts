import { Router } from 'express';
import {
  addReview,
  getReviewsForRecipe,
  updateReview,
  deleteReview,
  getUserReviewForRecipe,
  getReviewsWithReplies,
  toggleReviewLike,
  toggleReviewReaction,
  createReply,
  toggleReplyLike,
  toggleReplyReaction,
} from '../controllers/ReviewController';
import { validate } from '@foodie/libs';
import { addReviewSchema, updateReviewSchema } from '../utils/validators';

const router = Router();

// POST /api/review/recipe - Add review (authenticated)
router.post('/recipe', validate(addReviewSchema), addReview);

// GET /api/review/recipe/:recipeId - Get all reviews for a recipe
router.get('/recipe/:recipeId', getReviewsForRecipe);

// GET /api/review/recipe/:recipeId/with-replies - Get reviews with replies
router.get('/recipe/:recipeId/with-replies', getReviewsWithReplies);

// GET /api/review/user/:recipeId - Get user's review for a recipe (authenticated)
router.get('/user/:recipeId', getUserReviewForRecipe);

// PATCH /api/review/:reviewId - Update review (authenticated)
router.patch('/:reviewId', validate(updateReviewSchema), updateReview);

// DELETE /api/review/:reviewId - Delete review (authenticated)
router.delete('/:reviewId', deleteReview);

// POST /api/review/:reviewId/like - Toggle like on review (authenticated)
router.post('/:reviewId/like', toggleReviewLike);

// POST /api/review/:reviewId/reaction - Toggle reaction on review (authenticated)
router.post('/:reviewId/reaction', toggleReviewReaction);

// POST /api/review/reply - Create reply to review or reply (authenticated)
router.post('/reply', createReply);

// POST /api/review/reply/:replyId/like - Toggle like on reply (authenticated)
router.post('/reply/:replyId/like', toggleReplyLike);

// POST /api/review/reply/:replyId/reaction - Toggle reaction on reply (authenticated)
router.post('/reply/:replyId/reaction', toggleReplyReaction);

export default router;
