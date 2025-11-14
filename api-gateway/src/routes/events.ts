import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3004';

/**
 * Proxy all /api/event/* requests to event-service
 * TODO: Implement event-service first
 */
router.use(
  '/',
  createProxyMiddleware({
    target: EVENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/event': '',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.requestId) {
        proxyReq.setHeader('x-request-id', req.requestId);
      }
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.userId);
      }
    },
    onError: (_err, _req, res: any) => {
      res.status(503).json({
        success: false,
        data: null,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Event service unavailable (not yet implemented)',
          },
        ],
      });
    },
  })
);

export default router;
