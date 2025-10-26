"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = void 0;
const crypto_1 = require("crypto");
const requestId = (req, res, next) => {
    const reqId = req.headers['x-request-id'] ||
        `req_${Date.now()}_${(0, crypto_1.randomBytes)(8).toString('hex')}`;
    req.headers['x-request-id'] = reqId;
    res.setHeader('x-request-id', reqId);
    req.requestId = reqId;
    next();
};
exports.requestId = requestId;
//# sourceMappingURL=requestId.js.map