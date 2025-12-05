import mongoose, { Document } from 'mongoose';
export interface IChannel extends Document {
    teamId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    type: 'text' | 'announcement';
    isPrivate: boolean;
    members: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IChannel, {}, {}, {}, mongoose.Document<unknown, {}, IChannel, {}, {}> & IChannel & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Channel.d.ts.map