"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const cookbook_types_1 = require("../Types/cookbook.types");
const CookbookSchema = new mongoose_1.Schema({
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
    },
    books: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Book',
        },
    ],
    theme: {
        type: String,
        enum: Object.values(cookbook_types_1.CookbookTheme),
        default: cookbook_types_1.CookbookTheme.MODERN,
    },
    layout: {
        type: String,
        enum: Object.values(cookbook_types_1.CookbookLayout),
        default: cookbook_types_1.CookbookLayout.SINGLE_COLUMN,
    },
    paperSize: {
        type: String,
        enum: Object.values(cookbook_types_1.PaperSize),
        default: cookbook_types_1.PaperSize.A4,
    },
    coverImage: {
        type: String,
        trim: true,
    },
    customColors: {
        primary: { type: String, trim: true },
        secondary: { type: String, trim: true },
        accent: { type: String, trim: true },
    },
    authorBio: {
        type: String,
        trim: true,
        maxlength: 2000,
    },
    authorImage: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: Object.values(cookbook_types_1.CookbookStatus),
        default: cookbook_types_1.CookbookStatus.DRAFT,
        index: true,
    },
    pdfUrl: {
        type: String,
        trim: true,
    },
    generationProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    errorMessage: {
        type: String,
        trim: true,
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    pageCount: {
        type: Number,
        min: 0,
    },
    fileSize: {
        type: Number,
        min: 0,
    },
    lastGeneratedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
CookbookSchema.index({ author: 1, isActive: 1, createdAt: -1 });
CookbookSchema.index({ status: 1, createdAt: -1 });
CookbookSchema.index({ isPublic: 1, isActive: 1 });
CookbookSchema.virtual('bookCount').get(function () {
    return this.books?.length || 0;
});
CookbookSchema.pre('save', function (next) {
    if (this.books && this.books.length > 100) {
        next(new Error('A cookbook cannot contain more than 100 books'));
    }
    else {
        next();
    }
});
const Cookbook = (0, mongoose_1.model)('Cookbook', CookbookSchema);
exports.default = Cookbook;
//# sourceMappingURL=Cookbook.js.map