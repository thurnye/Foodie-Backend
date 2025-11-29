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
        '^/api/recipe': '/api/recipe',
        '^/api/review': '/api/review',
    },
    onProxyReq: (proxyReq, req) => {
        console.log('Forwarding===========================');
        if (req.requestId) {
            proxyReq.setHeader('x-request-id', req.requestId);
        }
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.userId);
            proxyReq.setHeader('x-user-email', req.user.email);
        }
    },
    onError: (_err, _req, res) => {
        console.log("ERROR::::=======", _err);
        res.status(503).json({
            success: false,
            data: null,
            errors: [
                {
                    code: 'SERVICE_UNAVAILABLE',
                    message: 'Recipe service unavailable',
                },
            ],
        });
    },
}));
exports.default = router;
//# sourceMappingURL=recipes.js.map