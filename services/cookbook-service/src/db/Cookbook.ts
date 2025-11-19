
import { Schema, model } from 'mongoose';
import { CookbookLayout, CookbookStatus, CookbookTheme, ICookbook, PaperSize } from '../Types/cookbook.types';

/**
 * Cookbook Schema
 */
const CookbookSchema = new Schema<ICookbook>(
  {
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

    books: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],



    // Customization options
    theme: {
      type: String,
      enum: Object.values(CookbookTheme),
      default: CookbookTheme.MODERN,
    },

    layout: {
      type: String,
      enum: Object.values(CookbookLayout),
      default: CookbookLayout.SINGLE_COLUMN,
    },

    paperSize: {
      type: String,
      enum: Object.values(PaperSize),
      default: PaperSize.A4,
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

    // Author information
    authorBio: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    authorImage: {
      type: String,
      trim: true,
    },

    // Status tracking
    status: {
      type: String,
      enum: Object.values(CookbookStatus),
      default: CookbookStatus.DRAFT,
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

    // Metadata
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
CookbookSchema.index({ author: 1, isActive: 1, createdAt: -1 });
CookbookSchema.index({ status: 1, createdAt: -1 });
CookbookSchema.index({ isPublic: 1, isActive: 1 });

// Virtual for book count
CookbookSchema.virtual('bookCount').get(function () {
  return this.books?.length || 0;
});

// Pre-save middleware to validate books array
CookbookSchema.pre('save', function (next) {
  if (this.books && this.books.length > 100) {
    next(new Error('A cookbook cannot contain more than 100 books'));
  } else {
    next();
  }
});

const Cookbook = model<ICookbook>('Cookbook', CookbookSchema);

export default Cookbook;
