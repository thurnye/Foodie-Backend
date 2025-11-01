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

    author: {
      type: Schema.Types.ObjectId,
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

    // Array of edited sections
    sections: [
      {
        sectionId: {
          type: String,
          required: true,
        },
        sectionType: {
          type: String,
          enum: ['cover', 'intro', 'toc', 'notes', 'recipe'],
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
BookSchema.index({ author: 1, isActive: 1, createdAt: -1 });
BookSchema.index({ status: 1, isPublic: 1 });

// Virtual for section count
BookSchema.virtual('sectionCount').get(function () {
  return this.sections?.length || 0;
});

const Book = model<IBook>('Book', BookSchema);

export default Book;
