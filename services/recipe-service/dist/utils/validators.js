"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewSchema = exports.addReviewSchema = exports.queryRecipesSchema = exports.updateRecipeSchema = exports.addRecipeSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const valueLabelSchema = joi_1.default.object({
    value: joi_1.default.string().required(),
    label: joi_1.default.string().required(),
});
const contentBlockSchema = joi_1.default.object({
    type: joi_1.default.string().valid('text', 'image', 'video', 'title').required(),
    value: joi_1.default.any().required(),
    isUnsplash: joi_1.default.boolean().optional(),
    isMultiple: joi_1.default.boolean().optional(),
});
const nutritionalFactSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    amount: joi_1.default.string().required(),
    unit: joi_1.default.string().required(),
});
const faqSchema = joi_1.default.object({
    ques: joi_1.default.string().optional(),
    ans: joi_1.default.string().optional(),
});
const ingredientSchema = joi_1.default.object({
    name: joi_1.default.string().required(),
    type: joi_1.default.string().valid('main', 'dressing').required(),
});
const methodSchema = joi_1.default.object({
    step: joi_1.default.array().items(contentBlockSchema).min(1),
});
exports.addRecipeSchema = joi_1.default.object({
    basicInfo: joi_1.default.object({
        recipeName: joi_1.default.string().required().trim(),
        duration: valueLabelSchema.required(),
        level: valueLabelSchema.required(),
        serving: valueLabelSchema.required(),
        tags: joi_1.default.array().items(valueLabelSchema).min(1),
        categories: joi_1.default.array().items(valueLabelSchema).min(1),
    }).required(),
    details: joi_1.default.object({
        thumbnail: joi_1.default.string().required(),
        about: joi_1.default.array().items(contentBlockSchema).min(1),
        faqs: joi_1.default.array().items(faqSchema).optional(),
    }).required(),
    nutritionalFacts: joi_1.default.array().items(nutritionalFactSchema).optional(),
    directions: joi_1.default.object({
        methods: joi_1.default.array().items(methodSchema).min(1),
        ingredients: joi_1.default.array().items(ingredientSchema).min(1),
    }).required(),
});
exports.updateRecipeSchema = joi_1.default.object({
    basicInfo: joi_1.default.object({
        recipeName: joi_1.default.string().trim().optional(),
        duration: valueLabelSchema.optional(),
        level: valueLabelSchema.optional(),
        serving: valueLabelSchema.optional(),
        tags: joi_1.default.array().items(valueLabelSchema).optional(),
        categories: joi_1.default.array().items(valueLabelSchema).optional(),
    }).optional(),
    details: joi_1.default.object({
        thumbnail: joi_1.default.string().optional(),
        about: joi_1.default.array().items(contentBlockSchema).optional(),
        faqs: joi_1.default.array().items(faqSchema).optional(),
    }).optional(),
    nutritionalFacts: joi_1.default.array().items(nutritionalFactSchema).optional(),
    directions: joi_1.default.object({
        methods: joi_1.default.array().items(methodSchema).optional(),
        ingredients: joi_1.default.array().items(ingredientSchema).optional(),
    }).optional(),
}).min(1);
exports.queryRecipesSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(100).default(10),
    search: joi_1.default.string().optional(),
    categories: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.array().items(joi_1.default.string())).optional(),
    tags: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.array().items(joi_1.default.string())).optional(),
    level: joi_1.default.string().optional(),
    minRating: joi_1.default.number().min(0).max(5).optional(),
    sortBy: joi_1.default.string().valid('createdAt', 'averageRating', 'recipeName').default('createdAt'),
    sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc'),
});
exports.addReviewSchema = joi_1.default.object({
    review: joi_1.default.string().required().trim().min(10).max(1000),
    rating: joi_1.default.number().required().min(1).max(5).integer(),
    recipeId: joi_1.default.string().required().pattern(/^[0-9a-fA-F]{24}$/),
});
exports.updateReviewSchema = joi_1.default.object({
    review: joi_1.default.string().trim().min(10).max(1000).optional(),
    rating: joi_1.default.number().min(1).max(5).integer().optional(),
}).min(1);
//# sourceMappingURL=validators.js.map