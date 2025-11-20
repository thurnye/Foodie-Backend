import { IBook, IBookSection, BookStatus, PageType, ICoverPageData, IIntroPageData, ITocPageData, IBackCoverPageData, IExtraPageData, PageLayoutFormat } from '../Types/book.types';
interface CreateBookData {
    bookId?: string;
    name?: string;
    description?: string;
    cookbookId: string;
    sections?: IBookSection[];
    recipeIds?: string[];
}
interface UpdateBookData {
    name?: string;
    description?: string;
    pages?: any[];
    sections?: IBookSection[];
    status?: BookStatus;
    isPublic?: boolean;
    layout?: string;
}
interface CreatePageData {
    pageType: PageType;
    position: number;
    coverData?: ICoverPageData;
    introData?: IIntroPageData;
    tocData?: ITocPageData;
    backCoverData?: IBackCoverPageData;
    recipe?: any;
    extraPageData?: IExtraPageData;
    layout?: string;
}
interface UpdatePageData {
    pageType?: PageType;
    position?: number;
    coverData?: ICoverPageData;
    introData?: IIntroPageData;
    tocData?: ITocPageData;
    backCoverData?: IBackCoverPageData;
    recipe?: any;
    extraPageData?: IExtraPageData;
    layout?: string;
    paperSize?: PageLayoutFormat;
    editedContent?: string;
}
declare class BookService {
    createBook(userId: string, data: CreateBookData): Promise<IBook>;
    private ensureRequiredPages;
    getBookById(bookId: string, userId?: string): Promise<IBook>;
    getBookByIdWithoutAuth(bookId: string): Promise<IBook>;
    getMyBooks(userId: string, query?: {
        page?: number;
        limit?: number;
        status?: BookStatus;
        isPublic?: boolean;
        cookbookId?: string;
    }): Promise<{
        books: IBook[];
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            totalBooks: number;
        };
    }>;
    updateBook(bookId: string, userId: string, updates: UpdateBookData): Promise<IBook>;
    updateBookUrl(bookId: string, bookUrl: string): Promise<void>;
    deleteBook(bookId: string, userId: string): Promise<void>;
    addPage(bookId: string, userId: string, pageData: CreatePageData): Promise<IBook>;
    updatePage(bookId: string, pageId: string, userId: string, updates: UpdatePageData): Promise<IBook>;
    deletePage(bookId: string, pageId: string, userId: string): Promise<IBook>;
    reorderPages(bookId: string, userId: string, pageOrder: {
        pageId: string;
        position: number;
    }[]): Promise<IBook>;
    publishBook(bookId: string, userId: string): Promise<IBook>;
}
declare const _default: BookService;
export default _default;
//# sourceMappingURL=BookService.d.ts.map