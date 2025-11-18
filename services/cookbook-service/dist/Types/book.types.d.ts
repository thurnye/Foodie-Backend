import { Document, Types } from 'mongoose';
export declare enum BookStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    ARCHIVED = "archived"
}
export declare enum PageType {
    COVER = "cover",
    INTRO = "intro",
    TOC = "toc",
    RECIPE = "recipe",
    NOTES = "notes",
    BACK_COVER = "backCover",
    EXTRA = "extra"
}
export interface ICoverPageData {
    pageId: string;
    pageType: PageType;
    position: number;
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    backgroundColor?: string;
    customText?: string;
    layout: string;
}
export interface IIntroPageData {
    pageId: string;
    pageType: PageType;
    position: number;
    backgroundImage?: string;
    customContent?: string;
    layout: string;
}
export interface IExtraPageData {
    pageId: string;
    position: number;
    title: string;
    pageType: 'blank' | 'template';
    templateType?: string;
    content?: string;
    layout?: string;
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
export interface IRecipeAuthor {
    userId: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    slogan?: string;
}
export interface IRecipePage {
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
    author: IRecipeAuthor;
    order: number;
    layout: string;
    pageId: {
        type: String;
        required: true;
    };
    pageType: PageType;
    position: number;
}
export interface IBook extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    cookbook: Types.ObjectId;
    coverData?: ICoverPageData;
    introData?: IIntroPageData;
    recipe?: IRecipePage[];
    extraPageData?: IExtraPageData;
    sections?: IBookSection[];
    status: BookStatus;
    isPublic: boolean;
    isActive: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=book.types.d.ts.map