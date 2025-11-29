import { Request, Response, NextFunction } from 'express';
import { Errors } from '@foodie/libs';

/**
 * Middleware to extract user context from request headers
 * Expected headers:
 * - x-user-id: User ID from authentication service
 * - x-user-email: User email
 * - x-user-name: User name
 */
export const userContext = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    const userName = req.headers['x-user-name'] as string;

    if (!userId) {
      throw Errors.unauthorized('User not authenticated');
    }

    // Attach user context to request object
    (req as any).user = {
      id: userId,
      email: userEmail,
      name: userName,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default userContext;
