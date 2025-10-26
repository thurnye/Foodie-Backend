import { logger } from '@foodie/libs';

/**
 * Audit logger for recipe service events
 */
export const auditLog = {
  /**
   * Log recipe creation
   */
  recipeCreated: (recipeId: string, userId: string, recipeName: string) => {
    logger.info('AUDIT: Recipe Created', {
      event: 'recipe.created',
      recipeId,
      userId,
      recipeName,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log recipe update
   */
  recipeUpdated: (recipeId: string, userId: string) => {
    logger.info('AUDIT: Recipe Updated', {
      event: 'recipe.updated',
      recipeId,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log recipe deletion
   */
  recipeDeleted: (recipeId: string, userId: string) => {
    logger.info('AUDIT: Recipe Deleted', {
      event: 'recipe.deleted',
      recipeId,
      userId,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log review creation
   */
  reviewCreated: (reviewId: string, recipeId: string, userId: string, rating: number) => {
    logger.info('AUDIT: Review Created', {
      event: 'review.created',
      reviewId,
      recipeId,
      userId,
      rating,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Log cookbook generation
   */
  cookbookGenerated: (userId: string, pdfId: string) => {
    logger.info('AUDIT: Cookbook Generated', {
      event: 'cookbook.generated',
      userId,
      pdfId,
      timestamp: new Date().toISOString(),
    });
  },
};
