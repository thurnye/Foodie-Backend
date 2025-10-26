import mongoose, { Document } from 'mongoose';
export interface IReview extends Document {
    _id: string;
    review: string;
    rating: number;
    userId: mongoose.Types.ObjectId;
    recipeId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default Review;
//# sourceMappingURL=Review.d.ts.map