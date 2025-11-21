import mongoose, { Schema, Document } from 'mongoose';

export type ReactionType = 'like' | 'love' | 'fire' | 'laugh' | 'sad' | 'wow';

export interface IReaction {
  user: mongoose.Types.ObjectId;
  type: ReactionType;
  createdAt: Date;
}

export interface IVote {
  user: mongoose.Types.ObjectId;
  value: 1 | -1; // 1 for upvote, -1 for downvote
  createdAt: Date;
}

export interface IPostMedia {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
}

export interface IPost extends Document {
  group: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  media?: IPostMedia[];
  votes: IVote[];
  voteCount: number;
  reactions: IReaction[];
  reactionCount: number;
  commentCount: number;
  shareCount: number;
  isPinned: boolean;
  isLocked: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

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

const PostMediaSchema = new Schema<IPostMedia>({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  thumbnail: String,
  alt: String,
});

const PostSchema = new Schema<IPost>(
  {
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
    },
    media: [PostMediaSchema],
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
    commentCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
PostSchema.index({ title: 'text', content: 'text' });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ voteCount: -1 });
PostSchema.index({ group: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });

// Calculate vote count
PostSchema.methods.calculateVoteCount = function () {
  this.voteCount = this.votes.reduce((sum: number, vote: any) => sum + vote.value, 0);
  return this.voteCount;
};

// Calculate reaction count
PostSchema.methods.calculateReactionCount = function () {
  this.reactionCount = this.reactions.length;
  return this.reactionCount;
};

export const Post = mongoose.model<IPost>('Post', PostSchema);
