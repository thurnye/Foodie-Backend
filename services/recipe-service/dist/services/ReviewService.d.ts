import { IReview } from '../db/Review';
import { IReviewReply } from '../db/ReviewReply';
export declare class ReviewService {
    createReview(userId: string, recipeId: string, reviewText: string, rating: number): Promise<IReview>;
    getReviewsByRecipe(recipeId: string, page?: number, limit?: number): Promise<{
        reviews: IReview[];
        total: number;
    }>;
    updateReview(reviewId: string, userId: string, updates: Partial<IReview>): Promise<IReview>;
    deleteReview(reviewId: string, userId: string): Promise<void>;
    updateRecipeAverageRating(recipeId: string): Promise<void>;
    getUserReviewForRecipe(userId: string, recipeId: string): Promise<IReview | null>;
    toggleReviewLike(reviewId: string, userId: string): Promise<IReview>;
    toggleReviewReaction(reviewId: string, userId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'): Promise<IReview>;
    createReply(userId: string, parentReviewId: string, reviewText: string, parentReplyId?: string): Promise<IReviewReply>;
    getRepliesByReview(parentReviewId: string): Promise<IReviewReply[]>;
    toggleReplyLike(replyId: string, userId: string): Promise<IReviewReply>;
    toggleReplyReaction(replyId: string, userId: string, reactionType: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'): Promise<IReviewReply>;
    getReviewsWithReplies(recipeId: string, page?: number, limit?: number): Promise<{
        reviews: any[];
        total: number;
    }>;
}
declare const _default: ReviewService;
export default _default;
//# sourceMappingURL=ReviewService.d.ts.map