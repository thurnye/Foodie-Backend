import mongoose, { Document, Types } from 'mongoose';
export interface IGroupMember {
    user: Types.ObjectId;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: Date;
}
export interface IGroup extends Document {
    name: string;
    description: string;
    coverImage?: string;
    icon?: string;
    isPrivate: boolean;
    creator: Types.ObjectId;
    members: IGroupMember[];
    joinRequest: Types.ObjectId[];
    memberCount: number;
    postCount: number;
    tags: string[];
    rules?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Group: mongoose.Model<IGroup, {}, {}, {}, mongoose.Document<unknown, {}, IGroup, {}, {}> & IGroup & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Group.model.d.ts.map