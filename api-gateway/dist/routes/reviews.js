"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const router = (0, express_1.Router)();
const RECIPE_SERVICE_URL = process.env.RECIPE_SERVICE_URL || 'http://localhost:3003';
router.use('/', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: RECIPE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/review': '/api/review',
    },
    onProxyReq: (proxyReq, req) => {
        if (req.requestId) {
            proxyReq.setHeader('x-request-id', req.requestId);
        }
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.userId);
        }
    },
    onError: (err, _req, res) => {
        res.status(503).json({
            success: false,
            message: 'Recipe service unavailable',
            error: err.message,
        });
    },
}));
exports.default = router;
//# sourceMappingURL=reviews.js.map