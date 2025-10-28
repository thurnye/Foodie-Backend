import { Request, Response, NextFunction } from 'express';
import RecipeService from '../services/RecipeService';
import { success, fail, logger } from '@foodie/libs';
import { getPaginationMeta } from '../utils/filters';

/**
 * Add new recipe
 */
export const addRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const recipeData = req.body;

    // Optionally verify authenticated user matches userId
    const authenticatedUserId = (req as any).user?.userId;
    if (authenticatedUserId && authenticatedUserId !== userId) {
      fail(res, 'You can only create recipes for your own account', 403);
      return;
    }

    const recipe = await RecipeService.createRecipe(userId, recipeData);

    logger.info('Recipe created', { recipeId: recipe._id, userId });

    success(
      res,
      {
        recipeId: recipe._id,
        recipeName: recipe.basicInfo.recipeName,
      },
      'Recipe created successfully',
      undefined,
      201
    );
  } catch (error) {
    logger.error('Add recipe error', { error });
    next(error);
  }
};

/**
 * List recipes with filters and pagination
 */
export const listRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const queryParams = req.body; // POST body for filters
    console.log('Query Params:', queryParams);

    const { recipes, total } = await RecipeService.getRecipes(queryParams);

    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 12;
    const meta = getPaginationMeta(page, limit, total);

    success(res, recipes, 'Recipes retrieved successfully', meta);
  } catch (error) {
    logger.error('List recipes error', { error });
    next(error);
  }
};

/**
 * Query recipes (advanced search)
 */
export const queryRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const searchParams = req.body;

    const { recipes, total } = await RecipeService.searchRecipes(searchParams);

    const page = parseInt(searchParams.page) || 1;
    const limit = parseInt(searchParams.limit) || 12;
    const meta = getPaginationMeta(page, limit, total);

    success(res, recipes, 'Recipes found', meta);
  } catch (error) {
    logger.error('Query recipes error', { error });
    next(error);
  }
};

/**
 * Get recipes by user
 */
export const getRecipesByUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.body.page) || parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.body.limit) || parseInt(req.query.limit as string) || 12;

    const { recipes, total } = await RecipeService.getRecipesByUser(userId, page, limit);

    const meta = getPaginationMeta(page, limit, total);

    success(res, recipes, 'User recipes retrieved successfully', meta);
  } catch (error) {
    logger.error('Get user recipes error', { error });
    next(error);
  }
};

/**
 * Get current user's recipes (authenticated)
 * Extracts user ID from JWT token
 */
export const getMyRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    // Get all recipes without pagination for dashboard
    const { recipes } = await RecipeService.getRecipesByUser(userId, 1, 1000);

    success(res, recipes, 'My recipes retrieved successfully');
  } catch (error) {
    logger.error('Get my recipes error', { error });
    next(error);
  }
};

/**
 * Get recipe by ID
 */
export const getRecipeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const recipe = await RecipeService.getRecipeById(id);

    success(res, recipe, 'Recipe retrieved successfully');
  } catch (error) {
    logger.error('Get recipe error', { error });
    next(error);
  }
};

/**
 * Update recipe
 */
export const updateRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const updates = req.body;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    const recipe = await RecipeService.updateRecipe(id, userId, updates);

    logger.info('Recipe updated', { recipeId: recipe._id, userId });

    success(res, recipe, 'Recipe updated successfully');
  } catch (error) {
    logger.error('Update recipe error', { error });
    next(error);
  }
};

/**
 * Delete recipe
 */
export const deleteRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Unauthorized', 401);
      return;
    }

    await RecipeService.deleteRecipe(id, userId);

    logger.info('Recipe deleted', { recipeId: id, userId });

    success(res, null, 'Recipe deleted successfully');
  } catch (error) {
    logger.error('Delete recipe error', { error });
    next(error);
  }
};
