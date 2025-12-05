import mongoose, { Document } from 'mongoose';
export type ReactionType = 'like' | 'love' | 'fire' | 'laugh' | 'sad' | 'wow';
export interface IReaction {
    user: mongoose.Types.ObjectId;
    type: ReactionType;
    createdAt: Date;
}
export interface IVote {
    user: mongoose.Types.ObjectId;
    value: 1 | -1;
    createdAt: Date;
}
export interface IPostMedia {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    alt?: string;
}
export interface IPost extends Document {
    group: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    title: string;
    content: string;
    media?: IPostMedia[];
    votes: IVote[];
    voteCount: number;
    reactions: IReaction[];
    reactionCount: number;
    commentCount: number;
    shareCount: number;
    isPinned: boolean;
    isLocked: boolean;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Post: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, {}> & IPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Post.model.d.ts.map