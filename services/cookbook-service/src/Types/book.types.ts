import { Document, Types } from "mongoose";

/**
 * Book Status
 */
export enum BookStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

/**
 * Section content - stores edited HTML content for each section
 */
export interface IBookSection {
  sectionId: string; // 'cover', 'intro', 'toc', 'notes', or recipe ID
  sectionType: 'frontCover' | 'backCover' | 'intro' | 'toc' | 'notes' | 'recipe';
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

export interface IBook extends Document {
  _id: Types.ObjectId;
  cookbook: Types.ObjectId; // Reference to original cookbook
  layout: string;
  recipe?:{
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
    author: Types.ObjectId;
  },

  // Edited sections content
  sections: IBookSection[];

  // Metadata
  status: BookStatus;
  isPublic: boolean;
  isActive: boolean;

  // Timestamps
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
