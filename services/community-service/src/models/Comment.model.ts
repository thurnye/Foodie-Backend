import mongoose, { Schema, Document } from 'mongoose';
import { IReaction, IVote } from './Post.model';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId;
  votes: IVote[];
  voteCount: number;
  reactions: IReaction[];
  reactionCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  value: {
    type: Number,
    enum: [1, -1],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ReactionSchema = new Schema<IReaction>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['like', 'love', 'fire', 'laugh', 'sad', 'wow'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CommentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      index: true,
    },
    votes: [VoteSchema],
    voteCount: {
      type: Number,
      default: 0,
    },
    reactions: [ReactionSchema],
    reactionCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: 1 });
CommentSchema.index({ author: 1, createdAt: -1 });

// Calculate vote count
CommentSchema.methods.calculateVoteCount = function () {
  this.voteCount = this.votes.reduce((sum: number, vote: any) => sum + vote.value, 0);
  return this.voteCount;
};

// Calculate reaction count
CommentSchema.methods.calculateReactionCount = function () {
  this.reactionCount = this.reactions.length;
  return this.reactionCount;
};

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
