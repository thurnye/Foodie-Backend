import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();
const RECIPE_SERVICE_URL = process.env.RECIPE_SERVICE_URL || 'http://localhost:3003';

/**
 * Proxy all /api/recipe/* and /api/review/* requests to recipe-service
 */
router.use(
  '/',
  createProxyMiddleware({
    target: RECIPE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/recipe': '/api/recipe',
      '^/api/review': '/api/review',
    },
    onProxyReq: (proxyReq, req: any) => {
      // Forward request ID for tracing
      if (req.requestId) {
        proxyReq.setHeader('x-request-id', req.requestId);
      }
      // Forward user info from auth middleware
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.userId);
        proxyReq.setHeader('x-user-email', req.user.email);
      }
    },
    onError: (_err, _req, res: any) => {
      res.status(503).json({
        success: false,
        data: null,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Recipe service unavailable',
          },
        ],
      });
    },
  })
);

export default router;
