import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();
const COMMUNICATION_SERVICE_URL = process.env.COMMUNICATION_SERVICE_URL || 'http://localhost:3009';

/**
 * Proxy all /api/communication/* requests to communication-service
 */
router.use(
  '/',
  createProxyMiddleware({
    target: COMMUNICATION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/communication': '/api/communication',
    },
    onProxyReq: (proxyReq, req: any, _res) => {
      // Forward request ID for tracing
      if (req.requestId) {
        proxyReq.setHeader('x-request-id', req.requestId);
      }
      // Forward user info from auth middleware
      if (req.user) {
        console.log('[Communication Proxy] req.user:', req.user);
        console.log('[Communication Proxy] Setting x-user-id:', req.user.userId);
        proxyReq.setHeader('x-user-id', req.user.userId);
        proxyReq.setHeader('x-user-email', req.user.email);
        proxyReq.setHeader('x-user-name', req.user.name || req.user.username || '');
      } else {
        console.log('[Communication Proxy] No req.user found for request:', req.method, req.path);
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
      console.log("ERROR::::=======", _err)
      res.status(503).json({
        success: false,
        data: null,
        errors: [
          {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Communication service unavailable',
          },
        ],
      });
    },
  })
);

export default router;
