"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const router = (0, express_1.Router)();
const COOKBOOK_SERVICE_URL = process.env.COOKBOOK_SERVICE_URL || 'http://localhost:3004';
router.use('/', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: COOKBOOK_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/cookbook': '/api/cookbook',
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
    onError: (_err, _req, res) => {
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
}));
exports.default = router;
//# sourceMappingURL=cookbooks.js.map