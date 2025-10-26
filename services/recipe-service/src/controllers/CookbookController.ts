import { Request, Response, NextFunction } from 'express';
import CookbookService from '../services/CookbookService';
import { success, fail, logger } from '@foodie/libs';

/**
 * Generate cookbook PDF for user
 */
export const generateCookbook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = (req as any).user?.userId;

    // Verify user can only generate their own cookbook
    if (authenticatedUserId && authenticatedUserId !== userId) {
      fail(res, 'You can only generate your own cookbook', 403);
      return;
    }

    const cookbook = await CookbookService.generateCookbook(userId);

    logger.info('Cookbook generated', { userId, pdfId: cookbook.pdfId });

    success(
      res,
      cookbook,
      'Cookbook generated successfully. Note: This is a stub implementation.',
      undefined,
      201
    );
  } catch (error) {
    logger.error('Generate cookbook error', { error });
    next(error);
  }
};

/**
 * Get cookbook status
 */
export const getCookbookStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { pdfId } = req.params;

    const status = await CookbookService.getCookbookStatus(pdfId);

    success(res, status, 'Cookbook status retrieved');
  } catch (error) {
    logger.error('Get cookbook status error', { error });
    next(error);
  }
};
