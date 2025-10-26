"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailSchema = exports.resetPasswordSchema = exports.resetRequestSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const libs_1 = require("@foodie/libs");
exports.registerSchema = joi_1.default.object({
    email: libs_1.commonSchemas.email,
    password: libs_1.commonSchemas.password,
    firstName: joi_1.default.string().optional().trim(),
    lastName: joi_1.default.string().optional().trim(),
    username: joi_1.default.string().alphanum().min(3).max(30).optional().trim(),
});
exports.loginSchema = joi_1.default.object({
    email: libs_1.commonSchemas.email,
    password: joi_1.default.string().required().messages({
        'any.required': 'Password is required',
    }),
});
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required().messages({
        'any.required': 'Current password is required',
    }),
    newPassword: libs_1.commonSchemas.password,
});
exports.resetRequestSchema = joi_1.default.object({
    email: libs_1.commonSchemas.email,
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        'any.required': 'Reset token is required',
    }),
    newPassword: libs_1.commonSchemas.password,
});
exports.verifyEmailSchema = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        'any.required': 'Verification token is required',
    }),
});
//# sourceMappingURL=validators.js.map