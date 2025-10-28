import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to extract user info from headers (set by API Gateway)
 * and attach to req.user for controller access
 */
export const userContextMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;

  if (userId) {
    (req as any).user = {
      userId,
      email: userEmail,
    };
  }

  next();
};
