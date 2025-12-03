import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();
const COOKBOOK_SERVICE_URL = process.env.COOKBOOK_SERVICE_URL || 'http://localhost:3004';

/**
 * Proxy all /api/cookbook/* requests to cookbook-service
 */
router.use(
  '/',
  createProxyMiddleware({
    target: COOKBOOK_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/cookbook': '/api/cookbook',
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



      // Re-stream parsed body for POST/PUT/PATCH requests
      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
    onError: (_err, _req, res: any) => {
      console.log('ERROR:::', _err)
      res.status(503).json({
        success: false,
        data: null,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Cookbook service unavailable',
          },
        ],
      });
    },
  })
);

export default router;
