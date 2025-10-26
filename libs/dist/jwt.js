"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signAccessToken = (payload) => {
    const secret = process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production';
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (payload) => {
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production';
    const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    const secret = process.env.JWT_ACCESS_SECRET || 'access-secret-key-change-in-production';
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-key-change-in-production';
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyRefreshToken = verifyRefreshToken;
const decodeToken = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwt.js.map