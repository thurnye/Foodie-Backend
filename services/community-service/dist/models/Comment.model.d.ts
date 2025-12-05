import mongoose, { Document } from 'mongoose';
import { IReaction, IVote } from './Post.model';
export interface IComment extends Document {
    post: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    parentComment?: mongoose.Types.ObjectId;
    votes: IVote[];
    voteCount: number;
    reactions: IReaction[];
    reactionCount: number;
    replyCount: number;
    isEdited: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Comment: mongoose.Model<IComment, {}, {}, {}, mongoose.Document<unknown, {}, IComment, {}, {}> & IComment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Comment.model.d.ts.map