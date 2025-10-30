import mongoose, { Schema, Document } from 'mongoose';

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

export interface IRecipe extends Document {
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
  reviews: Array<{ review: mongoose.Types.ObjectId }>;
  author: mongoose.Types.ObjectId;
  averageRating?: number;
  totalReviews?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
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
    nutritionalFacts: [
      {
        name: { type: String, required: true },
        amount: { type: String, required: true },
        unit: { type: String, required: true },
      },
    ],
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
    reviews: [
      {
        review: {
          type: Schema.Types.ObjectId,
          ref: 'Reviews',
        },
      },
    ],
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
RecipeSchema.index({ 'basicInfo.recipeName': 'text' });
RecipeSchema.index({ author: 1, isActive: 1, createdAt: -1 });
RecipeSchema.index({ 'basicInfo.categories.value': 1, isActive: 1 });
RecipeSchema.index({ 'basicInfo.tags.value': 1, isActive: 1 });
RecipeSchema.index({ averageRating: -1, isActive: 1 });
RecipeSchema.index({ createdAt: -1, isActive: 1 });
RecipeSchema.index({ isActive: 1 });

const Recipe = mongoose.model<IRecipe>('Recipes', RecipeSchema);

export default Recipe;
