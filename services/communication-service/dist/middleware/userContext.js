"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userContext = void 0;
const libs_1 = require("@foodie/libs");
const userContext = (req, _res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        const userEmail = req.headers['x-user-email'];
        const userName = req.headers['x-user-name'];
        if (!userId) {
            throw libs_1.Errors.unauthorized('User not authenticated');
        }
        req.user = {
            id: userId,
            email: userEmail,
            name: userName,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.userContext = userContext;
exports.default = exports.userContext;
//# sourceMappingURL=userContext.js.map