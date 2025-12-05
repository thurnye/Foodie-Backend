"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_proxy_middleware_1 = require("http-proxy-middleware");
const router = (0, express_1.Router)();
const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL;
router.use('/', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: EVENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/event': '/api/event',
    },
    onProxyReq: (proxyReq, req, _res) => {
        if (req.requestId) {
            proxyReq.setHeader('x-request-id', req.requestId);
        }
        if (req.user) {
            console.log('[Event Proxy] req.user:', req.user);
            console.log('[Event Proxy] Setting x-user-id:', req.user.userId);
            proxyReq.setHeader('x-user-id', req.user.userId);
            proxyReq.setHeader('x-user-email', req.user.email);
        }
        else {
            console.log('[Event Proxy] No req.user found for request:', req.method, req.path);
        }
        if (req.body && Object.keys(req.body).length > 0) {
            const bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
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
                    message: 'Event service unavailable',
                },
            ],
        });
    },
}));
exports.default = router;
//# sourceMappingURL=events.js.map