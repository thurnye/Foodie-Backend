import { IReview } from '../db/Review';
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
}
declare const _default: ReviewService;
export default _default;
//# sourceMappingURL=ReviewService.d.ts.map