"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryCookbooksSchema = exports.updateCookbookSchema = exports.createCookbookSchema = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            }));
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
const customColorsSchema = joi_1.default.object({
    primary: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondary: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
    accent: joi_1.default.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
}).optional();
exports.createCookbookSchema = joi_1.default.object({
    title: joi_1.default.string().required().trim().min(1).max(200),
    description: joi_1.default.string().trim().max(1000).optional(),
    recipes: joi_1.default.array().items(joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/)).min(0).max(100).optional(),
    theme: joi_1.default.string().valid('modern', 'classic', 'rustic', 'minimalist', 'elegant').optional(),
    layout: joi_1.default.string().valid('single-column', 'two-column', 'magazine').optional(),
    coverImage: joi_1.default.string().uri().optional(),
    customColors: customColorsSchema,
    authorBio: joi_1.default.string().trim().max(2000).optional(),
    authorImage: joi_1.default.string().uri().optional(),
    isPublic: joi_1.default.boolean().optional(),
});
exports.updateCookbookSchema = joi_1.default.object({
    title: joi_1.default.string().trim().min(1).max(200).optional(),
    description: joi_1.default.string().trim().max(1000).optional(),
    recipes: joi_1.default.array().items(joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/)).min(0).max(100).optional(),
    theme: joi_1.default.string().valid('modern', 'classic', 'rustic', 'minimalist', 'elegant').optional(),
    layout: joi_1.default.string().valid('single-column', 'two-column', 'magazine').optional(),
    coverImage: joi_1.default.string().uri().optional(),
    customColors: customColorsSchema,
    authorBio: joi_1.default.string().trim().max(2000).optional(),
    authorImage: joi_1.default.string().uri().optional(),
    isPublic: joi_1.default.boolean().optional(),
}).min(1);
exports.queryCookbooksSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    status: joi_1.default.string().valid('draft', 'generating', 'completed', 'failed').optional(),
    isPublic: joi_1.default.boolean().optional(),
    sortBy: joi_1.default.string().valid('createdAt', 'updatedAt', 'title').default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
//# sourceMappingURL=validators.js.map