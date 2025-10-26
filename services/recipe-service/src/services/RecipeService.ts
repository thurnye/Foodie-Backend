import Recipe, { IRecipe } from '../db/Recipe';
import { Errors, logger } from '@foodie/libs';
import { buildRecipeFilter, buildSortOptions } from '../utils/filters';
import { fetchUsersData } from '../utils/userClient';

/**
 * Recipe Service - Business logic for recipe operations
 */
export class RecipeService {
  /**
   * Populate author data for recipes
   */
  private async populateAuthors(recipes: any[]): Promise<any[]> {
    if (recipes.length === 0) return recipes;

    // Extract unique author IDs
    const authorIds = recipes
      .map(recipe => recipe.author?.toString())
      .filter((id): id is string => !!id);

    // Fetch all author data in batch
    const authorsMap = await fetchUsersData(authorIds);

    // Add author data to recipes
    return recipes.map(recipe => ({
      ...recipe,
      author: authorsMap.get(recipe.author?.toString()) || recipe.author,
    }));
  }
  /**
   * Create a new recipe
   */
  async createRecipe(userId: string, recipeData: Partial<IRecipe>): Promise<IRecipe> {
    const recipe = await Recipe.create({
      ...recipeData,
      author: userId,
    });
    return recipe;
  }

  /**
   * Get recipe by ID
   */
  async getRecipeById(recipeId: string): Promise<IRecipe> {
    const recipe = await Recipe.findById(recipeId).lean();

    if (!recipe) {
      throw Errors.notFound('Recipe not found');
    }

    // Populate author data
    const [populatedRecipe] = await this.populateAuthors([recipe]);

    return populatedRecipe as unknown as IRecipe;
  }

  /**
   * Get recipes with filters and pagination
   */
  async getRecipes(queryParams: any): Promise<{ recipes: IRecipe[]; total: number }> {
    logger.info('Query Params:', queryParams);

    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 12;
    const skip = (page - 1) * limit;
    
    console.log('♦️ Pagination - Page:', page, 'Limit:', limit, 'Skip:', skip);

    const filter = buildRecipeFilter(queryParams);
    const sort = buildSortOptions(queryParams.sortBy, queryParams.sortOrder);
    console.log('♦️ Filter:', filter);

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .select('_id details.thumbnail basicInfo.recipeName basicInfo.level basicInfo.duration author averageRating totalReviews')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Recipe.countDocuments(filter),
    ]);


    // const totalDoc = 

    console.log('Recipes fetched:',  total);

    // Populate author data
    const populatedRecipes = await this.populateAuthors(recipes);

    return { recipes: populatedRecipes as unknown as IRecipe[], total };
  }

  /**
   * Get recipes by user ID
   */
  async getRecipesByUser(userId: string, page = 1, limit = 12): Promise<{ recipes: IRecipe[]; total: number }> {
    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      Recipe.find({ author: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Recipe.countDocuments({ author: userId }),
    ]);

    // Populate author data
    const populatedRecipes = await this.populateAuthors(recipes);

    return { recipes: populatedRecipes as unknown as IRecipe[], total };
  }

  /**
   * Update recipe
   */
  async updateRecipe(recipeId: string, userId: string, updates: Partial<IRecipe>): Promise<IRecipe> {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      throw Errors.notFound('Recipe not found');
    }

    // Check if user is the author
    if (recipe.author.toString() !== userId) {
      throw Errors.forbidden('You can only update your own recipes');
    }

    // Update recipe
    Object.assign(recipe, updates);
    await recipe.save();

    return recipe;
  }

  /**
   * Delete recipe
   */
  async deleteRecipe(recipeId: string, userId: string): Promise<void> {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      throw Errors.notFound('Recipe not found');
    }

    // Check if user is the author
    if (recipe.author.toString() !== userId) {
      throw Errors.forbidden('You can only delete your own recipes');
    }

    await Recipe.findByIdAndDelete(recipeId);
  }

  /**
   * Add review reference to recipe
   */
  async addReviewToRecipe(recipeId: string, reviewId: string): Promise<void> {
    await Recipe.findByIdAndUpdate(recipeId, {
      $push: { reviews: { review: reviewId } },
    });
  }

  /**
   * Update recipe average rating
   */
  async updateRecipeRating(recipeId: string, averageRating: number, totalReviews: number): Promise<void> {
    await Recipe.findByIdAndUpdate(recipeId, {
      averageRating,
      totalReviews,
    });
  }

  /**
   * Search recipes (advanced query)
   */
  async searchRecipes(searchParams: any): Promise<{ recipes: IRecipe[]; total: number }> {
    return this.getRecipes(searchParams);
  }
}

export default new RecipeService();
