import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();
const COMMUNITY_SERVICE_URL = process.env.COMMUNITY_SERVICE_URL!;

/**
 * Proxy all /api/community/* requests to community-service
 */
router.use(
  '/',
  createProxyMiddleware({
    target: COMMUNITY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/community': '/api/community',
    },
    onProxyReq: (proxyReq, req: any, _res) => {
      // Forward request ID for tracing
      if (req.requestId) {
        proxyReq.setHeader('x-request-id', req.requestId);
      }
      // Forward user info from auth middleware
      if (req.user) {
        // console.log('[Community Proxy] req.user:', req.user);
        // console.log('[Community Proxy] Setting x-user-id:', req.user.userId);
        proxyReq.setHeader('x-user-id', req.user.userId);
        proxyReq.setHeader('x-user-email', req.user.email);
      } else {
        console.log('[Community Proxy] No req.user found for request:', req.method, req.path);
      }

      // Re-stream the body if it was parsed by body-parser
      if (req.body && Object.keys(req.body).length > 0) {
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
            message: 'Community service unavailable',
          },
        ],
      });
    },
  })
);

export default router;
