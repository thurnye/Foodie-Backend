import mongoose, { Document } from 'mongoose';
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
    users: mongoose.Types.ObjectId[];
    count: number;
}
export interface IMessage extends Document {
    channelId?: mongoose.Types.ObjectId;
    conversationId?: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    type: 'text' | 'file' | 'image' | 'video' | 'system';
    attachments?: IAttachment[];
    mentions?: mongoose.Types.ObjectId[];
    reactions?: IReaction[];
    isEdited: boolean;
    isDeleted: boolean;
    replyTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage, {}, {}> & IMessage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Message.d.ts.map