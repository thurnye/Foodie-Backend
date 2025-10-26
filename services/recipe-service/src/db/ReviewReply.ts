import mongoose, { Schema, Document } from 'mongoose';

export interface IReaction {
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
  userId: mongoose.Types.ObjectId;
}

export interface IReviewReply extends Document {
  _id: string;
  review: string;
  userId: mongoose.Types.ObjectId;
  parentReviewId: mongoose.Types.ObjectId;
  parentReplyId?: mongoose.Types.ObjectId; // For nested replies
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

const ReviewReplySchema = new Schema<IReviewReply>(
  {
    review: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    parentReviewId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Reviews',
      index: true,
    },
    parentReplyId: {
      type: Schema.Types.ObjectId,
      ref: 'ReviewReplies',
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

// Index for querying replies by parent review
ReviewReplySchema.index({ parentReviewId: 1, createdAt: 1 });
// Index for querying nested replies
ReviewReplySchema.index({ parentReplyId: 1, createdAt: 1 });

const ReviewReply = mongoose.model<IReviewReply>('ReviewReplies', ReviewReplySchema);

export default ReviewReply;
