import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL!;

/**
 * Proxy all /api/user/* requests to user-service
 */
router.use(
  '/',
  createProxyMiddleware({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/user': '', // Remove /api/user prefix
    },
    onProxyReq: (proxyReq, req: any) => {
      // Forward request ID and user info
      if (req.requestId) {
        proxyReq.setHeader('x-request-id', req.requestId);
      }
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
      res.status(503).json({
        success: false,
        data: null,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message: 'User service unavailable',
          },
        ],
      });
    },
  })
);

export default router;
