import { Document, Types } from "mongoose";
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
export declare enum CookbookTheme {
    MODERN = "modern",
    CLASSIC = "classic",
    RUSTIC = "rustic",
    MINIMALIST = "minimalist",
    ELEGANT = "elegant"
}
export declare enum CookbookStatus {
    DRAFT = "draft",
    GENERATING = "generating",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum CookbookLayout {
    SINGLE_COLUMN = "single-column",
    TWO_COLUMN = "two-column",
    MAGAZINE = "magazine"
}
export declare enum PaperSize {
    A4 = "A4",
    LETTER = "Letter",
    LEGAL = "Legal",
    A5 = "A5"
}
export interface IExtraPage {
    pageId: string;
    title: string;
    pageType: 'blank' | 'template';
    templateType?: 'weekly-planner' | 'note-page';
    section: 'front' | 'back';
    position: number;
    createdAt?: Date;
}
export interface ICookbook extends Document {
    _id: Types.ObjectId;
    author: Types.ObjectId;
    title: string;
    description?: string;
    books: Types.ObjectId[];
    theme: CookbookTheme;
    layout: CookbookLayout;
    paperSize?: PaperSize;
    coverImage?: string;
    customColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    authorBio?: string;
    authorImage?: string;
    status: CookbookStatus;
    pdfUrl?: string;
    generationProgress?: number;
    errorMessage?: string;
    isPublic: boolean;
    isActive: boolean;
    pageCount?: number;
    fileSize?: number;
    lastGeneratedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICookBookRecipe {
    _id: string;
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
}
export interface ICookbookPopulated extends Omit<ICookbook, 'books'> {
    books: any[];
}
//# sourceMappingURL=cookbook.types.d.ts.map