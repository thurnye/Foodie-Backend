"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userContextMiddleware = void 0;
const libs_1 = require("@foodie/libs");
const userContextMiddleware = (req, res, next) => {
    void res;
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    if (userId) {
        libs_1.logger.info('User context extracted', {
            userId,
            userEmail,
            path: req.path,
            method: req.method,
        });
    }
    next();
};
exports.userContextMiddleware = userContextMiddleware;
//# sourceMappingURL=userContext.js.map