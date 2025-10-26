"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const libs_1 = require("@foodie/libs");
const libs_2 = require("@foodie/libs");
const authenticate = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.replace('Bearer ', '') ||
            req.headers['x-access-token'];
        if (!token) {
            (0, libs_2.fail)(res, 'Access token required', 401);
            return;
        }
        const payload = (0, libs_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        (0, libs_2.fail)(res, 'Invalid or expired access token', 401);
    }
};
exports.authenticate = authenticate;
const optionalAuth = (req, _res, next) => {
    try {
        const token = req.headers['authorization']?.replace('Bearer ', '') ||
            req.headers['x-access-token'];
        if (token) {
            const payload = (0, libs_1.verifyAccessToken)(token);
            req.user = payload;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map