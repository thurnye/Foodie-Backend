"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const router = (0, express_1.Router)();
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
router.use('/', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/user': '',
    },
    onProxyReq: (proxyReq, req) => {
        if (req.requestId) {
            proxyReq.setHeader('x-request-id', req.requestId);
        }
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.userId);
            proxyReq.setHeader('x-user-email', req.user.email);
        }
    },
    onError: (err, _req, res) => {
        res.status(503).json({
            success: false,
            message: 'User service unavailable',
            error: err.message,
        });
    },
}));
exports.default = router;
//# sourceMappingURL=users.js.map