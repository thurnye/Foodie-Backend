import mongoose, { Document } from 'mongoose';
export interface IValueLabel {
    value: string;
    label: string;
}
export interface IContentBlock {
    type: 'text' | 'image' | 'video' | 'title';
    value: any;
    isUnsplash?: boolean;
    isMultiple?: boolean;
}
export interface INutritionalFact {
    name: string;
    amount: string;
    unit: string;
}
export interface IFAQ {
    ques: string;
    ans: string;
}
export interface IIngredient {
    name: string;
    type: 'main' | 'dressing';
}
export interface IMethod {
    step: IContentBlock[];
}
export interface IRecipe extends Document {
    _id: mongoose.Types.ObjectId;
    basicInfo: {
        recipeName: string;
        duration: IValueLabel;
        level: IValueLabel;
        serving: IValueLabel;
        tags: IValueLabel[];
        categories: IValueLabel[];
    };
    details: {
        thumbnail: string;
        about: IContentBlock[];
        faqs: IFAQ[];
    };
    nutritionalFacts: INutritionalFact[];
    directions: {
        methods: IMethod[];
        ingredients: IIngredient[];
    };
    reviews: Array<{
        review: mongoose.Types.ObjectId;
    }>;
    author: mongoose.Types.ObjectId;
    averageRating?: number;
    totalReviews?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Recipe: mongoose.Model<IRecipe, {}, {}, {}, mongoose.Document<unknown, {}, IRecipe, {}, {}> & IRecipe & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Recipe;
//# sourceMappingURL=Recipe.d.ts.map