"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.createRateLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const response_1 = require("./response");
const createRateLimiter = (options) => {
    const limiter = new rate_limiter_flexible_1.RateLimiterMemory({
        points: options?.points || 100,
        duration: options?.duration || 60,
        blockDuration: options?.blockDuration || 60,
    });
    return async (req, res, next) => {
        try {
            const key = req.ip || req.socket.remoteAddress || 'unknown';
            await limiter.consume(key);
            next();
        }
        catch (error) {
            (0, response_1.fail)(res, 'Too many requests, please try again later', 429);
            return;
        }
    };
};
exports.createRateLimiter = createRateLimiter;
exports.authRateLimiter = (0, exports.createRateLimiter)({
    points: 5,
    duration: 60,
    blockDuration: 300,
});
//# sourceMappingURL=rateLimit.js.map