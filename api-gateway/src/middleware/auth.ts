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
      console.log('[OptionalAuth] Token verified, payload:', payload);
      (req as any).user = payload;
    } else {
      console.log('[OptionalAuth] No token found in request headers');
    }

    next();
  } catch (error) {
    console.log('[OptionalAuth] Token verification failed:', error);
    // Token was provided but invalid - continue anyway for optional auth
    next();
  }
};
