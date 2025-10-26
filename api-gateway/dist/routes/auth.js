"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
router.use('/', rateLimit_1.authRateLimit, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '',
    },
    onProxyReq: (proxyReq, req) => {
        if (req.requestId) {
            proxyReq.setHeader('x-request-id', req.requestId);
        }
    },
    onError: (err, _req, res) => {
        res.status(503).json({
            success: false,
            message: 'Auth service unavailable',
            error: err.message,
        });
    },
}));
exports.default = router;
//# sourceMappingURL=auth.js.map