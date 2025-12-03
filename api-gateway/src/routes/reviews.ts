import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();
const RECIPE_SERVICE_URL = process.env.RECIPE_SERVICE_URL || 'http://localhost:3003';

/**
 * Proxy all /api/review/* requests to recipe-service
 */
router.use(
  '/',
  createProxyMiddleware({
    target: RECIPE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/review': '/api/review',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.requestId) {
        proxyReq.setHeader('x-request-id', req.requestId);
      }
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.userId);
      }

      // Re-stream parsed body for POST/PUT/PATCH requests
      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
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
