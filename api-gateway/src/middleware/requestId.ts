import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

/**
 * Request ID middleware for distributed tracing
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const reqId =
    (req.headers['x-request-id'] as string) ||
    `req_${Date.now()}_${randomBytes(8).toString('hex')}`;

  req.headers['x-request-id'] = reqId;
  res.setHeader('x-request-id', reqId);

  (req as any).requestId = reqId;

  next();
};
