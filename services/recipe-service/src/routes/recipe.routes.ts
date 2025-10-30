import { Router } from 'express';
import {
  addRecipe,
  listRecipes,
  queryRecipes,
  getRecipesByUser,
  getMyRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
} from '../controllers/RecipeController';
import { validate } from '@foodie/libs';
import { addRecipeSchema, updateRecipeSchema, queryRecipesSchema } from '../utils/validators';

const router = Router();

// POST /api/recipe/add - Add new recipe (userId from JWT token) - MUST BE BEFORE /:id
router.post('/add', validate(addRecipeSchema), addRecipe);

// GET /api/recipe/my-recipes - Get current user's recipes - MUST BE BEFORE /:id
router.get('/my-recipes', getMyRecipes);

// POST /api/recipe - List recipes with filters/pagination
router.post('/', validate(queryRecipesSchema), listRecipes);

// POST /api/recipe/query - Advanced query
router.post('/query', validate(queryRecipesSchema), queryRecipes);

// POST /api/recipe/user/:userId - Get user's recipes
router.post('/user/:userId', getRecipesByUser);

// GET /api/recipe/:id - Get recipe by ID
router.get('/:id', getRecipeById);

// PATCH /api/recipe/:id - Update recipe (authenticated)
router.patch('/:id', validate(updateRecipeSchema), updateRecipe);

// DELETE /api/recipe/:id - Delete recipe (authenticated)
router.delete('/:id', deleteRecipe);

export default router;
