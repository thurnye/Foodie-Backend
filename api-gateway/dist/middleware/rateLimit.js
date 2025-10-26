"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimit = exports.defaultRateLimit = void 0;
const libs_1 = require("@foodie/libs");
exports.defaultRateLimit = (0, libs_1.createRateLimiter)({
    points: 100,
    duration: 60,
});
exports.authRateLimit = (0, libs_1.createRateLimiter)({
    points: 10,
    duration: 60,
    blockDuration: 300,
});
//# sourceMappingURL=rateLimit.js.map