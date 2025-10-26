"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const signup_1 = __importDefault(require("./signup"));
const login_1 = __importDefault(require("./login"));
const refresh_1 = __importDefault(require("./refresh"));
const logout_1 = __importDefault(require("./logout"));
const passwordReset_1 = __importDefault(require("./passwordReset"));
const authRouter = require('express').Router();
authRouter.use('/register', signup_1.default);
authRouter.use('/login', login_1.default);
authRouter.use('/refresh', refresh_1.default);
authRouter.use('/logout', logout_1.default);
authRouter.use('/', passwordReset_1.default);
authRouter.get('/me', login_1.default);
exports.default = authRouter;
//# sourceMappingURL=index.js.map