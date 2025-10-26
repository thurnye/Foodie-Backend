import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '@foodie/libs';
import { fail } from '@foodie/libs';

/**
 * JWT authentication middleware
 * Verifies the access token and attaches user info to request
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const token = req.headers['authorization']?.replace('Bearer ', '') ||
                  req.headers['x-access-token'] as string;

    if (!token) {
      fail(res, 'Access token required', 401);
      return;
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Attach user info to request
    (req as any).user = payload;

    next();
  } catch (error) {
    fail(res, 'Invalid or expired access token', 401);
  }
};

/**
 * Optional authentication - doesn't fail if token is missing
 * But validates if present
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers['authorization']?.replace('Bearer ', '') ||
                  req.headers['x-access-token'] as string;

    if (token) {
      const payload = verifyAccessToken(token);
      (req as any).user = payload;
    }

    next();
  } catch (error) {
    // Token was provided but invalid - continue anyway for optional auth
    next();
  }
};
