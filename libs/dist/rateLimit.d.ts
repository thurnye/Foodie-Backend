import { Request, Response, NextFunction } from 'express';
export declare const createRateLimiter: (options?: {
    points?: number;
    duration?: number;
    blockDuration?: number;
}) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rateLimit.d.ts.map