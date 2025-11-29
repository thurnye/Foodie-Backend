"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const router = (0, express_1.Router)();
const COMMUNITY_SERVICE_URL = process.env.COMMUNITY_SERVICE_URL || 'http://localhost:3005';
router.use('/', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: COMMUNITY_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/community': '/api/community',
    },
    onProxyReq: (proxyReq, req, _res) => {
        if (req.requestId) {
            proxyReq.setHeader('x-request-id', req.requestId);
        }
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.userId);
            proxyReq.setHeader('x-user-email', req.user.email);
        }
        else {
            console.log('[Community Proxy] No req.user found for request:', req.method, req.path);
        }
        if (req.body && Object.keys(req.body).length > 0) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
        }
    },
    onError: (_err, _req, res) => {
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
}));
exports.default = router;
//# sourceMappingURL=community.js.map