import axios from 'axios';
import { logger } from '@foodie/libs';
import { IRecipePage } from '../Types/book.types';

const RECIPE_SERVICE_URL = process.env.RECIPE_SERVICE_URL!;

/**
 * Fetch recipe data from recipe-service
*/
export async function fetchRecipeData(
  recipeId: string
): Promise<IRecipePage | null> {
  try {
    console.log('RECIPE_SERVICE_URL:::', RECIPE_SERVICE_URL)
    const response = await axios.get(`${RECIPE_SERVICE_URL}/api/recipe/${recipeId}`, {
      timeout: 5000,
    });

    if (response.data.success && response.data.data) {
      console.log('Fetching RECIPE data from recipe-service...', response.data.data);
      const recipe = response.data.data;
      console.log('Fetched RECIPE data Ends====================:');
      return recipe;
    }

    return null;
  } catch (error: any) {
    logger.warn('Failed to fetch recipe data', {
      recipeId,
      error: error.message,
    });
    return null;
  }
}
