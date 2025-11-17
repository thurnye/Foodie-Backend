"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = exports.commonSchemas = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const response_1 = require("./response");
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            console.log('Validation error:', errorMessage);
            (0, response_1.fail)(res, errorMessage, 422);
            return;
        }
        req.body = value;
        next();
    };
};
exports.validate = validate;
exports.commonSchemas = {
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required',
    }),
    objectId: joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
        'string.pattern.base': 'Invalid ID format',
    }),
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10),
    }),
};
const sanitize = (input) => {
    if (typeof input !== 'string')
        return input;
    return input
        .replace(/[<>]/g, '')
        .trim();
};
exports.sanitize = sanitize;
//# sourceMappingURL=validation.js.map