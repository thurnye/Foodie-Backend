"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const book_types_1 = require("../Types/book.types");
const BookSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    cookbook: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Cookbook',
        required: true,
        index: true,
    },
    coverData: {
        pageId: String,
        pageType: {
            type: String,
            enum: Object.values(book_types_1.PageType),
        },
        position: Number,
        title: String,
        subtitle: String,
        backgroundImage: String,
        backgroundColor: String,
        customText: String,
        layout: String,
        paperSize: {
            type: String,
            enum: Object.values(book_types_1.PageLayoutFormat),
        },
    },
    introData: {
        pageId: String,
        pageType: {
            type: String,
            enum: Object.values(book_types_1.PageType),
        },
        position: Number,
        backgroundImage: String,
        customContent: String,
        layout: String,
        paperSize: {
            type: String,
            enum: Object.values(book_types_1.PageLayoutFormat),
        },
    },
    tocData: {
        pageId: String,
        pageType: {
            type: String,
            enum: Object.values(book_types_1.PageType),
        },
        position: Number,
        customContent: String,
        layout: String,
        paperSize: {
            type: String,
            enum: Object.values(book_types_1.PageLayoutFormat),
        },
    },
    backCoverData: {
        pageId: String,
        pageType: {
            type: String,
            enum: Object.values(book_types_1.PageType),
        },
        position: Number,
        title: String,
        subtitle: String,
        backgroundImage: String,
        backgroundColor: String,
        customText: String,
        layout: String,
        paperSize: {
            type: String,
            enum: Object.values(book_types_1.PageLayoutFormat),
        },
    },
    recipe: [
        {
            pageId: {
                type: String,
                required: true,
            },
            pageType: {
                type: String,
                enum: Object.values(book_types_1.PageType),
                required: true,
            },
            position: {
                type: Number,
                required: true,
            },
            basicInfo: {
                recipeName: { type: String, trim: true, index: 'text' },
                duration: {
                    value: String,
                    label: String,
                },
                level: {
                    value: String,
                    label: String,
                },
                serving: {
                    value: String,
                    label: String,
                },
                tags: [
                    {
                        value: String,
                        label: String,
                    },
                ],
                categories: [
                    {
                        value: String,
                        label: String,
                    },
                ],
            },
            details: {
                thumbnail: String,
                about: [
                    {
                        type: {
                            type: String,
                            enum: ['text', 'image', 'video', 'title'],
                        },
                        value: mongoose_1.Schema.Types.Mixed,
                        isUnsplash: Boolean,
                        isMultiple: Boolean,
                    },
                ],
                faqs: [
                    {
                        ques: String,
                        ans: String,
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
                                    enum: ['title', 'text', 'image', 'video'],
                                },
                                value: mongoose_1.Schema.Types.Mixed,
                                isUnsplash: Boolean,
                                isMultiple: Boolean,
                            },
                        ],
                    },
                ],
                ingredients: [
                    {
                        name: String,
                        type: { type: String, enum: ['main', 'dressing'] },
                    },
                ],
            },
            author: {
                userId: {
                    type: String,
                    required: true,
                },
                firstName: String,
                lastName: String,
                avatar: String,
                slogan: String,
            },
            order: {
                type: Number,
                required: true,
                default: 1,
            },
            layout: {
                type: String,
                required: true,
                default: 'layout-one',
            },
            paperSize: {
                type: String,
                enum: Object.values(book_types_1.PageLayoutFormat),
                default: 'A3',
            },
        },
    ],
    extraPageData: [
        {
            pageId: {
                type: String,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            pageType: {
                type: String,
                enum: ['blank', 'template'],
                required: true,
            },
            templateType: {
                type: String,
                enum: ['weekly-planner', 'note-page'],
            },
            section: {
                type: String,
                enum: ['front', 'back'],
                required: true,
            },
            position: {
                type: Number,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            paperSize: {
                type: String,
                enum: Object.values(book_types_1.PageLayoutFormat),
            },
        },
    ],
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
    bookUrl: {
        type: String,
    },
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
BookSchema.index({ cookbook: 1, 'recipe.pageId': 1 });
BookSchema.index({
    'recipe.author.userId': 1,
    isActive: 1,
    createdAt: -1,
});
BookSchema.index({ status: 1, isPublic: 1 });
BookSchema.index({ 'recipe.position': 1 });
BookSchema.virtual('recipeCount').get(function () {
    return this.recipe?.length || 0;
});
BookSchema.virtual('sectionCount').get(function () {
    return this.sections?.length || 0;
});
const Book = (0, mongoose_1.model)('Book', BookSchema);
exports.default = Book;
//# sourceMappingURL=Book.js.map