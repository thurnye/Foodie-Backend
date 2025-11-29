import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  description?: string;
  avatar?: string;
  members: mongoose.Types.ObjectId[]; // User IDs
  channels: mongoose.Types.ObjectId[]; // Channel IDs
  owner: mongoose.Types.ObjectId; // User ID
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema: Schema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [2, 'Team name must be at least 2 characters'],
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    avatar: {
      type: String,
      trim: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Team owner is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
TeamSchema.index({ owner: 1 });
TeamSchema.index({ members: 1 });
TeamSchema.index({ name: 1 });

export default mongoose.model<ITeam>('Team', TeamSchema);
