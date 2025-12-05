import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map