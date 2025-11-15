import { Document, Types } from "mongoose";
export declare enum BookStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export interface IBookSection {
    sectionId: string;
    sectionType: 'frontCover' | 'backCover' | 'intro' | 'toc' | 'notes' | 'recipe';
    content: string;
    lastEditedAt: Date;
}
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
export interface IBook extends Document {
    _id: Types.ObjectId;
    cookbook: Types.ObjectId;
    layout: string;
    recipe?: {
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
        directions: {
            methods: IMethod[];
            ingredients: IIngredient[];
        };
        author: Types.ObjectId;
    };
    sections: IBookSection[];
    status: BookStatus;
    isPublic: boolean;
    isActive: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=book.types.d.ts.map