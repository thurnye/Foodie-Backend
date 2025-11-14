import { Document, Types } from "mongoose";

export interface IValueLabel {
  value: string;
  label: string;
}

export interface IContentBlock {
  type: 'text' | 'image' | 'video' | 'title';
  value: any;
  isUnsplash?: boolean;
  isMultiple?: boolean;
}

export interface INutritionalFact {
  name: string;
  amount: string;
  unit: string;
}

export interface IFAQ {
  ques: string;
  ans: string;
}

export interface IIngredient {
  name: string;
  type: 'main' | 'dressing';
}

export interface IMethod {
  step: IContentBlock[];
}


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
 * Paper Size Options
 */
export enum PaperSize {
  A4 = 'A4',
  LETTER = 'Letter',
  LEGAL = 'Legal',
  A5 = 'A5',
}

/**
 * Cookbook Interface
 */
export interface ICookbook extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  title: string;
  description?: string;
  books: Types.ObjectId[];

  // Customization
  theme: CookbookTheme;
  layout: CookbookLayout;
  paperSize?: PaperSize;
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

export interface ICookBookRecipe {
  _id: string;
  basicInfo: {
    recipeName: string;
    duration: IValueLabel;
    level: IValueLabel;
    serving: IValueLabel;
    tags: IValueLabel[];
    categories: IValueLabel[];
  };
  details: {
    thumbnail: string;
    about: IContentBlock[];
    faqs: IFAQ[];
  };
  nutritionalFacts: INutritionalFact[];
  directions: {
    methods: IMethod[];
    ingredients: IIngredient[];
  };
}

/**
 * Cookbook with populated books (for API responses)
 */
export interface ICookbookPopulated extends Omit<ICookbook, 'books'> {
  books: any[]; // Full book objects instead of ObjectIds
}

