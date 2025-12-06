import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authRateLimit } from '../middleware/rateLimit';

const router = Router();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL!;

/**
 * Proxy all /api/auth/* requests to auth-service
 */
router.use(
  '/',
  authRateLimit, // Apply strict rate limiting to auth endpoints
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '', // Remove /api/auth prefix when forwarding
    },
    onProxyReq: (proxyReq, req: any) => {
      // console.log('Forwarding===========================')

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
      if (
        req.body &&
        (req.method === 'POST' ||
          req.method === 'PUT' ||
          req.method === 'PATCH')
      ) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }

      // console.log('Forwarding ENDs===========================')
    },
    onError: (_err, _req, res: any) => {
      res.status(503).json({
        success: false,
        data: null,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Auth service unavailable',
          },
        ],
      });
    },
  })
);

export default router;
