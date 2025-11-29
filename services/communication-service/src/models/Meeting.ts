import mongoose, { Schema, Document } from 'mongoose';

export interface IMeeting extends Document {
  title: string;
  description?: string;
  organizer: mongoose.Types.ObjectId; // User ID
  participants: mongoose.Types.ObjectId[]; // User IDs
  teamId?: mongoose.Types.ObjectId;
  channelId?: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  isRecurring: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema = new Schema<IMeeting>(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Organizer is required'],
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurrencePattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    link: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validation: End time must be after start time
MeetingSchema.pre('save', function (this: IMeeting, next) {
  if (this.endTime <= this.startTime) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

// Indexes for performance
MeetingSchema.index({ organizer: 1 });
MeetingSchema.index({ participants: 1 });
MeetingSchema.index({ startTime: 1 });
MeetingSchema.index({ status: 1 });
MeetingSchema.index({ teamId: 1 });
MeetingSchema.index({ channelId: 1 });

export default mongoose.model<IMeeting>('Meeting', MeetingSchema);
