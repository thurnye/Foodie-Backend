import { Request, Response, NextFunction } from 'express';
import CookbookService from '../services/CookbookService';
import { success, fail, logger } from '@foodie/libs';

/**
 * Create a new cookbook
 */
export const createCookbook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      fail(res, 'Authentication required. Please log in to create a cookbook.', 401);
      return;
    }

    const cookbookData = req.body;
    const cookbook = await CookbookService.createCookbook(userId, cookbookData);

    logger.info('Cookbook created', { cookbookId: cookbook._id, userId });

    success(
      res,
      {
        cookbookId: cookbook._id,
        title: cookbook.title,
        bookCount: cookbook.books?.length || 0,
        status: cookbook.status,
      },
      'Cookbook created successfully',
      undefined,
      201
    );
  } catch (error) {
    logger.error('Create cookbook error', { error });
    next(error);
  }
};

/**
 * Get cookbook by ID
 */
export const getCookbookById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    logger.info('Getting cookbook by ID', {
      cookbookId: id,
      userId: userId || 'not authenticated',
      headers: {
        'x-user-id': req.headers['x-user-id'],
        'x-user-email': req.headers['x-user-email']
      }
    });

    const cookbook = await CookbookService.getCookbookById(id, userId);

    success(res, cookbook, 'Cookbook retrieved successfully');
  } catch (error) {
    logger.error('Get cookbook error', { error, cookbookId: req.params.id });
    next(error);
  }
};

/**
 * Get current user's cookbooks
 */
export const getMyCookbooks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      fail(res, 'Authentication required', 401);
      return;
    }

    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      status: req.query.status as any,
      isPublic: req.query.isPublic ? req.query.isPublic === 'true' : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    };

    const result = await CookbookService.getMyCookbooks(userId, query);

    success(res, result.cookbooks, 'Cookbooks retrieved successfully', result.pagination);
  } catch (error) {
    logger.error('Get my cookbooks error', { error });
    next(error);
  }
};

/**
 * Get public cookbooks
 */
export const getPublicCookbooks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
    };

    const result = await CookbookService.getPublicCookbooks(query);

    success(res, result.cookbooks, 'Public cookbooks retrieved successfully', result.pagination);
  } catch (error) {
    logger.error('Get public cookbooks error', { error });
    next(error);
  }
};

/**
 * Update cookbook
 */
export const updateCookbook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Authentication required', 401);
      return;
    }

    const updates = req.body;
    const cookbook = await CookbookService.updateCookbook(id, userId, updates);

    logger.info('Cookbook updated', { cookbookId: id, userId });

    success(
      res,
      {
        cookbookId: cookbook._id,
        title: cookbook.title,
        status: cookbook.status,
      },
      'Cookbook updated successfully'
    );
  } catch (error) {
    logger.error('Update cookbook error', { error, cookbookId: req.params.id });
    next(error);
  }
};

/**
 * Delete cookbook (soft delete)
 */
export const deleteCookbook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Authentication required', 401);
      return;
    }

    await CookbookService.deleteCookbook(id, userId);

    logger.info('Cookbook deleted', { cookbookId: id, userId });

    success(res, { cookbookId: id }, 'Cookbook deleted successfully');
  } catch (error) {
    logger.error('Delete cookbook error', { error, cookbookId: req.params.id });
    next(error);
  }
};

/**
 * Generate cookbook PDF
 * This endpoint initiates PDF generation and returns immediately with status
 * The actual generation happens asynchronously
 */
export const generateCookbook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      fail(res, 'Authentication required', 401);
      return;
    }

    // Get the cookbook and verify permissions
    const cookbook = await CookbookService.getCookbookById(id, userId);

    // Check if user is the author
    if (cookbook.author.toString() !== userId) {
      fail(res, 'You can only generate your own cookbooks', 403);
      return;
    }

    // Update status to generating
    await CookbookService.updateGenerationStatus(id, 'generating' as any, 0);

    logger.info('Cookbook generation initiated', { cookbookId: id, userId });

    // TODO: Trigger async PDF generation job here
    // For now, return success message
    success(
      res,
      {
        cookbookId: id,
        status: 'generating',
        message: 'Cookbook generation has been initiated',
      },
      'Cookbook generation started successfully'
    );

    // TODO: In production, this would trigger a background job:
    // await queuePDFGeneration(id);
  } catch (error) {
    logger.error('Generate cookbook error', { error, cookbookId: req.params.id });
    next(error);
  }
};

/**
 * Get cookbook generation status
 */
export const getCookbookStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    const cookbook = await CookbookService.getCookbookById(id, userId);

    success(
      res,
      {
        cookbookId: id,
        status: cookbook.status,
        progress: cookbook.generationProgress,
        pdfUrl: cookbook.pdfUrl,
        errorMessage: cookbook.errorMessage,
        lastGeneratedAt: cookbook.lastGeneratedAt,
      },
      'Cookbook status retrieved successfully'
    );
  } catch (error) {
    logger.error('Get cookbook status error', { error, cookbookId: req.params.id });
    next(error);
  }
};

// Extra page methods removed - extra pages are now stored in books, not cookbooks
// Use the book service and BookController methods instead
