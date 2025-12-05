import mongoose, { Document } from 'mongoose';
export interface IReaction {
    type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry';
    userId: mongoose.Types.ObjectId;
}
export interface IReview extends Document {
    _id: mongoose.Types.ObjectId;
    review: string;
    rating: number;
    userId: mongoose.Types.ObjectId;
    recipeId: mongoose.Types.ObjectId;
    likes: mongoose.Types.ObjectId[];
    reactions: IReaction[];
    createdAt: Date;
    updatedAt: Date;
}
declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Review;
//# sourceMappingURL=Review.d.ts.map