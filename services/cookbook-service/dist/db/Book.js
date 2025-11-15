"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const book_types_1 = require("../Types/book.types");
const BookSchema = new mongoose_1.Schema({
    cookbook: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Cookbook',
        required: true,
        index: true,
    },
    layout: String,
    recipe: {
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
        author: {
            type: mongoose_1.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
    },
    sections: [
        {
            sectionId: {
                type: String,
                required: true,
            },
            sectionType: {
                type: String,
                enum: ['frontCover', 'backCover', 'intro', 'toc', 'notes', 'recipe'],
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            lastEditedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    status: {
        type: String,
        enum: Object.values(book_types_1.BookStatus),
        default: book_types_1.BookStatus.DRAFT,
        index: true,
    },
    isPublic: {
        type: Boolean,
        default: false,
        index: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    publishedAt: {
        type: Date,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
BookSchema.index({ cookbook: 1, isActive: 1 });
BookSchema.index({ cookbook: 1, recipe: 1 });
BookSchema.index({ recipe: 1, isActive: 1, createdAt: -1 });
BookSchema.index({ status: 1, isPublic: 1 });
BookSchema.virtual('sectionCount').get(function () {
    return this.sections?.length || 0;
});
const Book = (0, mongoose_1.model)('Book', BookSchema);
exports.default = Book;
//# sourceMappingURL=Book.js.map