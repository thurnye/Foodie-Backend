"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userContextMiddleware = void 0;
const userContextMiddleware = (req, _res, next) => {
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    if (userId) {
        req.user = {
            userId,
            email: userEmail,
        };
    }
    next();
};
exports.userContextMiddleware = userContextMiddleware;
//# sourceMappingURL=userContext.js.map