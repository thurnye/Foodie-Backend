import { Schema, model, Document, Types } from 'mongoose';

/**
 * Cookbook Theme Options
 */
export enum CookbookTheme {
  MODERN = 'modern',
  CLASSIC = 'classic',
  RUSTIC = 'rustic',
  MINIMALIST = 'minimalist',
  ELEGANT = 'elegant',
}

/**
 * Cookbook Status
 */
export enum CookbookStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Cookbook Layout Options
 */
export enum CookbookLayout {
  SINGLE_COLUMN = 'single-column',
  TWO_COLUMN = 'two-column',
  MAGAZINE = 'magazine',
}

/**
 * Cookbook Interface
 */
export interface ICookbook extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  description?: string;
  recipes: Types.ObjectId[];

  // Customization
  theme: CookbookTheme;
  layout: CookbookLayout;
  coverImage?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };

  // Author info (optional for "About Me" section)
  authorBio?: string;
  authorImage?: string;

  // Status & Output
  status: CookbookStatus;
  pdfUrl?: string;
  generationProgress?: number;
  errorMessage?: string;

  // Metadata
  isPublic: boolean;
  isActive: boolean;
  pageCount?: number;
  fileSize?: number;
  lastGeneratedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

    recipes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recipe',
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

// Virtual for recipe count
CookbookSchema.virtual('recipeCount').get(function () {
  return this.recipes?.length || 0;
});

// Pre-save middleware to validate recipes array
CookbookSchema.pre('save', function (next) {
  if (this.recipes && this.recipes.length > 100) {
    next(new Error('A cookbook cannot contain more than 100 recipes'));
  } else {
    next();
  }
});

const Cookbook = model<ICookbook>('Cookbook', CookbookSchema);

export default Cookbook;
