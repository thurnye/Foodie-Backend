import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction {
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  userId: mongoose.Types.ObjectId;
}

export interface IReview extends Document {
 _id: mongoose.Types.ObjectId;
  review: string;
  rating: number;
  userId: mongoose.Types.ObjectId;
  recipeId: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  reactions: IReaction[];
  createdAt: Date;
  updatedAt: Date;
}

const ReactionSchema = new Schema<IReaction>(
  {
    type: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
  {
    review: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Recipes',
      index: true,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    reactions: [ReactionSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one review per user per recipe
ReviewSchema.index({ userId: 1, recipeId: 1 }, { unique: true });
ReviewSchema.index({ recipeId: 1, createdAt: -1 });

const Review = mongoose.model<IReview>('Reviews', ReviewSchema);

export default Review;
