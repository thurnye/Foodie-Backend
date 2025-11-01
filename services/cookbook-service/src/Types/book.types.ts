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
  sectionType: 'cover' | 'intro' | 'toc' | 'notes' | 'recipe';
  content: string; // HTML content from editor
  lastEditedAt: Date;
}

/**
 * Book Interface - Stores edited cookbook content
 */
export interface IBook extends Document {
  _id: Types.ObjectId;
  cookbook: Types.ObjectId; // Reference to original cookbook
  author: Types.ObjectId;
  title: string;
  description?: string;

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
