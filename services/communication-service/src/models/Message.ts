import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
  _id: mongoose.Types.ObjectId;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  size: number;
  mimeType: string;
  preview?: string;
}

export interface IReaction {
  emoji: string;
  users: mongoose.Types.ObjectId[]; // User IDs
  count: number;
}

export interface IMessage extends Document {
  channelId?: mongoose.Types.ObjectId;
  conversationId?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId; // User ID
  content: string;
  type: 'text' | 'file' | 'image' | 'video' | 'system';
  attachments?: IAttachment[];
  mentions?: mongoose.Types.ObjectId[]; // User IDs
  reactions?: IReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  replyTo?: mongoose.Types.ObjectId; // Message ID
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'other'],
    required: true,
  },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  preview: { type: String },
});

const ReactionSchema = new Schema<IReaction>({
  emoji: { type: String, required: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  count: { type: Number, default: 0 },
});

const MessageSchema: Schema = new Schema<IMessage>(
  {
    channelId: {
      type: Schema.Types.ObjectId,
      ref: 'Channel',
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    type: {
      type: String,
      enum: ['text', 'file', 'image', 'video', 'system'],
      default: 'text',
    },
    attachments: [AttachmentSchema],
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reactions: [ReactionSchema],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

// Validation: Message must belong to either a channel or conversation
MessageSchema.pre('save', function (next) {
  if (!this.channelId && !this.conversationId) {
    next(new Error('Message must belong to either a channel or a conversation'));
  } else if (this.channelId && this.conversationId) {
    next(new Error('Message cannot belong to both a channel and a conversation'));
  } else {
    next();
  }
});

// Indexes for performance
MessageSchema.index({ channelId: 1, createdAt: -1 });
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ mentions: 1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
