import { IRecipe } from '../db/Recipe';
export declare class RecipeService {
    private populateAuthors;
    createRecipe(userId: string, recipeData: Partial<IRecipe>): Promise<IRecipe>;
    getRecipeById(recipeId: string): Promise<IRecipe>;
    getRecipes(queryParams: any): Promise<{
        recipes: IRecipe[];
        total: number;
    }>;
    getRecipesByUser(userId: string, page?: number, limit?: number): Promise<{
        recipes: IRecipe[];
        total: number;
    }>;
    updateRecipe(recipeId: string, userId: string, updates: Partial<IRecipe>): Promise<IRecipe>;
    deleteRecipe(recipeId: string, userId: string): Promise<void>;
    addReviewToRecipe(recipeId: string, reviewId: string): Promise<void>;
    updateRecipeRating(recipeId: string, averageRating: number, totalReviews: number): Promise<void>;
    searchRecipes(searchParams: any): Promise<{
        recipes: IRecipe[];
        total: number;
    }>;
}
declare const _default: RecipeService;
export default _default;
//# sourceMappingURL=RecipeService.d.ts.map