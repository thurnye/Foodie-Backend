import { Request, Response } from 'express';
declare class BookController {
    createBook(req: Request, res: Response): Promise<void>;
    getBookById(req: Request, res: Response): Promise<void>;
    getMyBooks(req: Request, res: Response): Promise<void>;
    updateBook(req: Request, res: Response): Promise<void>;
    deleteBook(req: Request, res: Response): Promise<void>;
    publishBook(req: Request, res: Response): Promise<void>;
}
declare const _default: BookController;
export default _default;
//# sourceMappingURL=BookController.d.ts.map