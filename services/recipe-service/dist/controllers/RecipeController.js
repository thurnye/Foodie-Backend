'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.deleteRecipe =
  exports.updateRecipe =
  exports.getRecipeById =
  exports.getMyRecipes =
  exports.getRecipesByUser =
  exports.queryRecipes =
  exports.listRecipes =
  exports.addRecipe =
    void 0;
const RecipeService_1 = __importDefault(require('../services/RecipeService'));
const libs_1 = require('@foodie/libs');
const filters_1 = require('../utils/filters');
const addRecipe = async (req, res, next) => {
  try {
    const recipeData = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      (0, libs_1.fail)(
        res,
        'Authentication required. Please log in to create or update a recipe.',
        401
      );
      return;
    }
    const isUpdate = !!recipeData._id;
    if (isUpdate) {
      const recipeId = recipeData._id;
      const { _id, ...updates } = recipeData;
      const recipe = await RecipeService_1.default.updateRecipe(
        recipeId,
        userId,
        updates
      );
      libs_1.logger.info('Recipe updated', { recipeId: recipe._id, userId });
      (0, libs_1.success)(
        res,
        {
          recipeId: recipe._id,
          recipeName: recipe.basicInfo.recipeName,
        },
        'Recipe updated successfully',
        undefined,
        200
      );
    } else {
      const recipe = await RecipeService_1.default.createRecipe(
        userId,
        recipeData
      );
      libs_1.logger.info('Recipe created', { recipeId: recipe._id, userId });
      (0, libs_1.success)(
        res,
        {
          recipeId: recipe._id,
          recipeName: recipe.basicInfo.recipeName,
        },
        'Recipe created successfully',
        undefined,
        201
      );
    }
  } catch (error) {
    libs_1.logger.error('Add/Update recipe error', { error });
    next(error);
  }
};
exports.addRecipe = addRecipe;
const listRecipes = async (req, res, next) => {
  try {
    const queryParams = req.body;
    // console.log('Query Params:', queryParams);
    // console.log('GETTING RECIPES:========================');
    const { recipes, total } = await RecipeService_1.default.getRecipes(
      queryParams
    );
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 12;
    const meta = (0, filters_1.getPaginationMeta)(page, limit, total);
    (0, libs_1.success)(res, recipes, 'Recipes retrieved successfully', meta);
  } catch (error) {
    libs_1.logger.error('List recipes error', { error });
    next(error);
  }
};
exports.listRecipes = listRecipes;
const queryRecipes = async (req, res, next) => {
  try {
    const searchParams = req.body;
    const { recipes, total } = await RecipeService_1.default.searchRecipes(
      searchParams
    );
    const page = parseInt(searchParams.page) || 1;
    const limit = parseInt(searchParams.limit) || 12;
    const meta = (0, filters_1.getPaginationMeta)(page, limit, total);
    (0, libs_1.success)(res, recipes, 'Recipes found', meta);
  } catch (error) {
    libs_1.logger.error('Query recipes error', { error });
    next(error);
  }
};
exports.queryRecipes = queryRecipes;
const getRecipesByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.body.page) || parseInt(req.query.page) || 1;
    const limit = parseInt(req.body.limit) || parseInt(req.query.limit) || 12;
    const { recipes, total } = await RecipeService_1.default.getRecipesByUser(
      userId,
      page,
      limit
    );
    const meta = (0, filters_1.getPaginationMeta)(page, limit, total);
    (0, libs_1.success)(
      res,
      recipes,
      'User recipes retrieved successfully',
      meta
    );
  } catch (error) {
    libs_1.logger.error('Get user recipes error', { error });
    next(error);
  }
};
exports.getRecipesByUser = getRecipesByUser;
const getMyRecipes = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      (0, libs_1.fail)(res, 'Unauthorized', 401);
      return;
    }
    const { recipes } = await RecipeService_1.default.getRecipesByUser(
      userId,
      1,
      1000
    );
    (0, libs_1.success)(res, recipes, 'My recipes retrieved successfully');
  } catch (error) {
    libs_1.logger.error('Get my recipes error', { error });
    next(error);
  }
};
exports.getMyRecipes = getMyRecipes;
const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await RecipeService_1.default.getRecipeById(id);
    (0, libs_1.success)(res, recipe, 'Recipe retrieved successfully');
  } catch (error) {
    libs_1.logger.error('Get recipe error', { error });
    next(error);
  }
};
exports.getRecipeById = getRecipeById;
const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const updates = req.body;
    if (!userId) {
      (0, libs_1.fail)(res, 'Unauthorized', 401);
      return;
    }
    const recipe = await RecipeService_1.default.updateRecipe(
      id,
      userId,
      updates
    );
    libs_1.logger.info('Recipe updated', { recipeId: recipe._id, userId });
    (0, libs_1.success)(res, recipe, 'Recipe updated successfully');
  } catch (error) {
    libs_1.logger.error('Update recipe error', { error });
    next(error);
  }
};
exports.updateRecipe = updateRecipe;
const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) {
      (0, libs_1.fail)(res, 'Unauthorized', 401);
      return;
    }
    await RecipeService_1.default.deleteRecipe(id, userId);
    libs_1.logger.info('Recipe deleted', { recipeId: id, userId });
    (0, libs_1.success)(res, null, 'Recipe deleted successfully');
  } catch (error) {
    libs_1.logger.error('Delete recipe error', { error });
    next(error);
  }
};
exports.deleteRecipe = deleteRecipe;
//# sourceMappingURL=RecipeController.js.map
