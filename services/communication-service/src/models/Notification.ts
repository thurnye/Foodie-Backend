import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'mention' | 'message' | 'meeting' | 'system';
  title: string;
  message: string;
  channelId?: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  meetingId?: mongoose.Types.ObjectId;
  messageId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    type: {
      type: String,
      enum: ['mention', 'message', 'meeting', 'system'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    meetingId: {
      type: Schema.Types.ObjectId,
      ref: 'Meeting',
    },
    messageId: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation
  }
);

// Indexes for performance
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
