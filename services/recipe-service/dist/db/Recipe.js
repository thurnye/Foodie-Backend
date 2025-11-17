"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const RecipeSchema = new mongoose_1.Schema({
    basicInfo: {
        recipeName: { type: String, required: true, trim: true, index: 'text' },
        duration: {
            value: { type: String, required: true },
            label: { type: String, required: true },
        },
        level: {
            value: { type: String, required: true },
            label: { type: String, required: true },
        },
        serving: {
            value: { type: String, required: true },
            label: { type: String, required: true },
        },
        tags: [
            {
                value: { type: String, required: true },
                label: { type: String, required: true },
            },
        ],
        categories: [
            {
                value: { type: String, required: true },
                label: { type: String, required: true },
            },
        ],
    },
    details: {
        thumbnail: { type: String, required: true },
        about: [
            {
                type: {
                    type: String,
                    required: true,
                    enum: ['text', 'image', 'video', 'title'],
                },
                value: { type: mongoose_1.Schema.Types.Mixed, required: true },
                isUnsplash: { type: Boolean },
                isMultiple: { type: Boolean },
            },
        ],
        faqs: [
            {
                ques: { type: String },
                ans: { type: String },
            },
        ],
    },
    nutritionalFacts: [
        {
            name: { type: String, required: true },
            amount: { type: String, required: true },
            unit: { type: String, required: true },
        },
    ],
    directions: {
        methods: [
            {
                step: [
                    {
                        type: {
                            type: String,
                            required: true,
                            enum: ['title', 'text', 'image', 'video'],
                        },
                        value: { type: mongoose_1.Schema.Types.Mixed, required: true },
                        isUnsplash: { type: Boolean },
                        isMultiple: { type: Boolean },
                    },
                ],
            },
        ],
        ingredients: [
            {
                name: { type: String, required: true },
                type: { type: String, required: true, enum: ['main', 'dressing'] },
            },
        ],
    },
    reviews: [
        {
            review: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Reviews',
            },
        },
    ],
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, {
    timestamps: true,
});
RecipeSchema.index({ 'basicInfo.recipeName': 'text' });
RecipeSchema.index({ author: 1, isActive: 1, createdAt: -1 });
RecipeSchema.index({ 'basicInfo.categories.value': 1, isActive: 1 });
RecipeSchema.index({ 'basicInfo.tags.value': 1, isActive: 1 });
RecipeSchema.index({ averageRating: -1, isActive: 1 });
RecipeSchema.index({ createdAt: -1, isActive: 1 });
RecipeSchema.index({ isActive: 1 });
const Recipe = mongoose_1.default.model('Recipes', RecipeSchema);
exports.default = Recipe;
//# sourceMappingURL=Recipe.js.map