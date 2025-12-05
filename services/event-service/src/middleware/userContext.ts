import { Request, Response, NextFunction } from 'express';
import { logger } from '@foodie/libs';

/**
 * Middleware to extract user context from API Gateway headers
 * The API Gateway should set these headers after authentication
 */
export const userContextMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;

  if (userId) {
    logger.info('User context extracted', {
      userId,
      userEmail,
      path: req.path,
      method: req.method,
    });
  }

  next();
};

