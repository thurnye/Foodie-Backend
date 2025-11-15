import { IBook, IBookSection, BookStatus } from '../Types/book.types';
interface CreateBookData {
    cookbookId: string;
    layout?: string;
    sections?: IBookSection[];
}
interface UpdateBookData {
    layout?: string;
    sections?: IBookSection[];
    status?: BookStatus;
    isPublic?: boolean;
}
declare class BookService {
    createBook(userId: string, data: CreateBookData, recipeData?: any): Promise<IBook>;
    getBookById(bookId: string, userId?: string): Promise<IBook>;
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
    deleteBook(bookId: string, userId: string): Promise<void>;
    publishBook(bookId: string, userId: string): Promise<IBook>;
}
declare const _default: BookService;
export default _default;
//# sourceMappingURL=BookService.d.ts.map