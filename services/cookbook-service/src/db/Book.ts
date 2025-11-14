import { Schema, model } from 'mongoose';
import { BookStatus, IBook } from '../Types/book.types';

/**
 * Book Schema - Stores edited cookbook content
 */
const BookSchema = new Schema<IBook>(
  {
    cookbook: {
      type: Schema.Types.ObjectId,
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
            value: { type: Schema.Types.Mixed, required: true },
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
                value: { type: Schema.Types.Mixed, required: true },
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
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
      },
    },

    // Array of edited sections
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

    // Status
    status: {
      type: String,
      enum: Object.values(BookStatus),
      default: BookStatus.DRAFT,
      index: true,
    },

    // Metadata
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
BookSchema.index({ cookbook: 1, isActive: 1 });
BookSchema.index({ cookbook: 1, recipe: 1 });
BookSchema.index({ recipe: 1, isActive: 1, createdAt: -1 });
BookSchema.index({ status: 1, isPublic: 1 });

// Virtual for section count
BookSchema.virtual('sectionCount').get(function () {
  return this.sections?.length || 0;
});

const Book = model<IBook>('Book', BookSchema);

export default Book;
