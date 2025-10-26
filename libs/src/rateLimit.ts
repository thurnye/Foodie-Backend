import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { fail } from './response';

/**
 * Create rate limiter middleware
 */
export const createRateLimiter = (options?: {
  points?: number;
  duration?: number;
  blockDuration?: number;
}) => {
  const limiter = new RateLimiterMemory({
    points: options?.points || 100, // Number of requests
    duration: options?.duration || 60, // Per 60 seconds
    blockDuration: options?.blockDuration || 60, // Block for 60 seconds if exceeded
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.ip || req.socket.remoteAddress || 'unknown';
      await limiter.consume(key);
      next();
    } catch (error) {
      fail(res, 'Too many requests, please try again later', 429);
      return;
    }
  };
};

/**
 * Strict rate limiter for auth endpoints
 */
export const authRateLimiter = createRateLimiter({
  points: 5,
  duration: 60,
  blockDuration: 300, // 5 minutes
});
