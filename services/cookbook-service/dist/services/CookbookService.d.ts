import { ICookbook, ICookbookPopulated, CookbookStatus, CookbookTheme, CookbookLayout } from '../Types/cookbook.types';
interface CreateCookbookData {
    title: string;
    description?: string;
    theme?: CookbookTheme;
    layout?: CookbookLayout;
    coverImage?: string;
    customColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    authorBio?: string;
    authorImage?: string;
    isPublic?: boolean;
}
interface UpdateCookbookData {
    title?: string;
    description?: string;
    theme?: CookbookTheme;
    layout?: CookbookLayout;
    coverImage?: string;
    customColors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    authorBio?: string;
    authorImage?: string;
    isPublic?: boolean;
}
interface ListCookbooksQuery {
    page?: number;
    limit?: number;
    status?: CookbookStatus;
    isPublic?: boolean;
    sortBy?: 'createdAt' | 'updatedAt' | 'title';
    sortOrder?: 'asc' | 'desc';
}
declare class CookbookService {
    createCookbook(userId: string, data: CreateCookbookData): Promise<ICookbook>;
    getCookbookById(cookbookId: string, userId?: string): Promise<ICookbook | ICookbookPopulated>;
    getMyCookbooks(userId: string, query?: ListCookbooksQuery): Promise<{
        cookbooks: (ICookbook | ICookbookPopulated)[];
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            totalCookbooks: number;
        };
    }>;
    getPublicCookbooks(query?: ListCookbooksQuery): Promise<{
        cookbooks: (ICookbook | ICookbookPopulated)[];
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            totalCookbooks: number;
        };
    }>;
    updateCookbook(cookbookId: string, userId: string, updates: UpdateCookbookData): Promise<ICookbook>;
    deleteCookbook(cookbookId: string, userId: string): Promise<void>;
    updateGenerationStatus(cookbookId: string, status: CookbookStatus, progress?: number, pdfUrl?: string, errorMessage?: string, pageCount?: number, fileSize?: number): Promise<ICookbook>;
    addExtraPage(cookbookId: string, userId: string, pageData: {
        title: string;
        pageType: 'blank' | 'template';
        templateType?: 'weekly-planner' | 'note-page';
        section: 'front' | 'back';
        position: number;
    }): Promise<ICookbook>;
    updateExtraPage(cookbookId: string, pageId: string, userId: string, updates: {
        title?: string;
        position?: number;
    }): Promise<ICookbook>;
    deleteExtraPage(cookbookId: string, pageId: string, userId: string): Promise<ICookbook>;
}
declare const _default: CookbookService;
export default _default;
//# sourceMappingURL=CookbookService.d.ts.map