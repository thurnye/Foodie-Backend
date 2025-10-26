import { createRateLimiter } from '@foodie/libs';

/**
 * Default rate limiter for all API endpoints
 * 100 requests per minute per IP
 */
export const defaultRateLimit = createRateLimiter({
  points: 100,
  duration: 60,
});

/**
 * Strict rate limiter for authentication endpoints
 * 10 requests per minute per IP
 */
export const authRateLimit = createRateLimiter({
  points: 10,
  duration: 60,
  blockDuration: 300, // 5 minutes
});
