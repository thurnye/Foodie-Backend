import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IGroupMember {
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: Date;
}

export interface IGroup extends Document {
  name: string;
  description: string;
  coverImage?: string;
  icon?: string;
  isPrivate: boolean;
  creator: mongoose.Types.ObjectId;
  members: IGroupMember[];
  memberCount: number;
  postCount: number;
  tags: string[];
  rules?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMember>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const GroupSchema = new Schema<IGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      maxlength: [100, 'Group name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    coverImage: {
      type: String,
    },
    icon: {
      type: String,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [GroupMemberSchema],
    memberCount: {
      type: Number,
      default: 1, // Creator is automatically a member
    },
    postCount: {
      type: Number,
      default: 0,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    rules: [{
      type: String,
      trim: true,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
GroupSchema.index({ name: 'text', description: 'text' });
GroupSchema.index({ tags: 1 });
GroupSchema.index({ creator: 1 });
GroupSchema.index({ 'members.user': 1 });

// Automatically add creator as admin member
GroupSchema.pre('save', function (next) {
  if (this.isNew) {
    this.members.push({
      user: this.creator,
      role: 'admin',
      joinedAt: new Date(),
    });
  }
  next();
});

export const Group = mongoose.model<IGroup>('Group', GroupSchema);
