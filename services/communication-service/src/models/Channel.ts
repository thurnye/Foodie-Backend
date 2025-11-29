import mongoose, { Schema, Document } from 'mongoose';

export interface IChannel extends Document {
  teamId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'text' | 'announcement';
  isPrivate: boolean;
  members: mongoose.Types.ObjectId[]; // User IDs
  lastMessage?: mongoose.Types.ObjectId; // Message ID
  createdAt: Date;
  updatedAt: Date;
}

const ChannelSchema: Schema = new Schema<IChannel>(
  {
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Team ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Channel name is required'],
      trim: true,
      minlength: [2, 'Channel name must be at least 2 characters'],
      maxlength: [100, 'Channel name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'announcement'],
      default: 'text',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ChannelSchema.index({ teamId: 1 });
ChannelSchema.index({ members: 1 });
ChannelSchema.index({ name: 1 });
ChannelSchema.index({ teamId: 1, name: 1 }, { unique: true }); // Unique channel name per team

export default mongoose.model<IChannel>('Channel', ChannelSchema);
