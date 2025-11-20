import { Request, Response } from 'express';
declare class PdfController {
    generateBookPdf(req: Request, res: Response): Promise<void>;
    generatePagePdf(req: Request, res: Response): Promise<void>;
    getPdfStatus(req: Request, res: Response): Promise<void>;
}
declare const _default: PdfController;
export default _default;
//# sourceMappingURL=PdfController.d.ts.map