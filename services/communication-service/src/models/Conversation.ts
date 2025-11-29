import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[]; // User IDs
  lastMessage?: mongoose.Types.ObjectId; // Message ID
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
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

// Validation: At least 2 participants
ConversationSchema.pre('save', function (this: IConversation, next) {
  if (this.participants.length < 2) {
    next(new Error('Conversation must have at least 2 participants'));
  } else {
    next();
  }
});

// Indexes for performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessage: 1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema);
