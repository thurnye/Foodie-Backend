declare class FileStorageService {
    private uploadsDir;
    private baseUrl;
    constructor();
    savePdf(bookId: string, pdfBuffer: Buffer): Promise<string>;
    deletePdf(fileUrl: string): Promise<void>;
    pdfExists(fileUrl: string): boolean;
}
declare const _default: FileStorageService;
export default _default;
//# sourceMappingURL=FileStorageService.d.ts.map