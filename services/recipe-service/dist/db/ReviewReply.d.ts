import mongoose, { Document } from 'mongoose';
export interface IReaction {
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
    userId: mongoose.Types.ObjectId;
}
export interface IReviewReply extends Document {
    _id: mongoose.Types.ObjectId;
    review: string;
    userId: mongoose.Types.ObjectId;
    parentReviewId: mongoose.Types.ObjectId;
    parentReplyId?: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    reactions: IReaction[];
    createdAt: Date;
    updatedAt: Date;
}
declare const ReviewReply: mongoose.Model<IReviewReply, {}, {}, {}, mongoose.Document<unknown, {}, IReviewReply, {}, {}> & IReviewReply & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default ReviewReply;
//# sourceMappingURL=ReviewReply.d.ts.map