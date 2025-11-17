import { Document, Types } from 'mongoose';

/**
 * Book Status
 */
export enum BookStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Page Type Enum
 */
export enum PageType {
  COVER = 'cover',
  INTRO = 'intro',
  TOC = 'toc',
  RECIPE = 'recipe',
  NOTES = 'notes',
  BACK_COVER = 'backCover',
  EXTRA = 'extra', // For custom pages (weekly planner, note pages, blank pages)
}

/**
 * Cover/Back Cover Page Data
 */
export interface ICoverPageData {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  customText?: string;
  layout: string; // e.g., 'cover-layout-one', 'back-cover-layout-one'
}

/**
 * Introduction Page Data
 */
export interface IIntroPageData {
  backgroundImage?: string;
  customContent?: string;
  layout: string; // e.g., 'intro-layout-one'
}

/**
 * Extra Page Data (for custom pages like weekly planner, note pages, blank pages)
 */
export interface IExtraPageData {
  title: string;
  pageType: 'blank' | 'template'; // blank page or template
  templateType?: string; // 'weekly-planner', 'note-page'
  content?: string; // HTML content if edited
  layout?: string;
}

/**
 * Section content - stores edited HTML content for each section
 */
export interface IBookSection {
  sectionId: string; // 'cover', 'intro', 'toc', 'notes', or recipe ID
  sectionType:
    | 'frontCover'
    | 'backCover'
    | 'intro'
    | 'toc'
    | 'notes'
    | 'recipe';
  content: string; // HTML content from editor
  lastEditedAt: Date;
}

/**
 * Book Interface - Stores edited cookbook content
 */

// Type definitions for recipe subdocuments
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

export interface IRecipeAuthor {
  userId: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  slogan?: string;
}

export interface IRecipePage {
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
  directions: {
    methods: IMethod[];
    ingredients: IIngredient[];
  };
  author: IRecipeAuthor;
}
/**
 * Page Interface - Represents a single page in the cookbook
 * This can be a cover page, intro page, recipe page, extra page, etc.
 */
export interface IPage {
  pageId: string; // Unique identifier for the page
  pageType: PageType;
  position: number; // Position/order in the cookbook

  // Cover page specific data
  coverData?: ICoverPageData;

  // Introduction page specific data
  introData?: IIntroPageData;

  // Recipe page specific data (if it's a recipe page)
  recipe?: IRecipePage[];

  // Extra page specific data (blank pages, templates)
  extraPageData?: IExtraPageData;

  // Layout for this specific page
  layout?: string;

  // Edited content for this page
  editedContent?: string;
  lastEditedAt?: Date;
}

export interface IBook extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  cookbook: Types.ObjectId; // Reference to original cookbook

  // Array of all pages in the book with their positions
  pages: IPage[];

  // Edited sections content (for backward compatibility, can be deprecated later)
  sections?: IBookSection[];

  // Metadata
  status: BookStatus;
  isPublic: boolean;
  isActive: boolean;

  // Timestamps
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
