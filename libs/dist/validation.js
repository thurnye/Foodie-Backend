"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = exports.optionalUserFields = exports.commonSchemas = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const response_1 = require("./response");
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');
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
    objectId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
        'string.pattern.base': 'Invalid ID format',
    }),
    pagination: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10),
    }),
};
exports.optionalUserFields = {
    firstName: joi_1.default.string().optional().trim().messages({
        'string.base': 'First name must be a valid string',
    }),
    lastName: joi_1.default.string().optional().trim().messages({
        'string.base': 'Last name must be a valid string',
    }),
    username: joi_1.default.string().alphanum().min(3).max(30).optional().trim().messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username cannot exceed 30 characters',
    }),
    bio: joi_1.default.string().max(500).optional().trim().messages({
        'string.max': 'Bio cannot exceed 500 characters',
    }),
    avatar: joi_1.default.string().uri().optional().messages({
        'string.uri': 'Avatar must be a valid URL',
    }),
    dateOfBirth: joi_1.default.string().optional(),
    gender: joi_1.default.string().optional(),
    phoneNumber: joi_1.default.string().optional(),
    address: joi_1.default.string().optional(),
    city: joi_1.default.string().optional(),
    state: joi_1.default.string().optional(),
    country: joi_1.default.string().optional(),
    postalCode: joi_1.default.string().optional(),
    slogan: joi_1.default.string().optional().trim(),
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