declare class PdfGenerationService {
    private frontendUrl;
    private browser;
    private generationStatus;
    constructor();
    getGenerationStatus(bookId: string): {
        current: string;
        total: number;
        currentStep: number;
    } | null;
    private updateGenerationStatus;
    private clearGenerationStatus;
    private initBrowser;
    closeBrowser(): Promise<void>;
    private generatePagePdf;
    generateBookPdf(bookId: string, userId: string): Promise<Buffer>;
    generateSinglePagePdf(bookId: string, pageId: string, pageType: string, userId: string): Promise<Buffer>;
}
declare const _default: PdfGenerationService;
export default _default;
//# sourceMappingURL=PdfGenerationService.d.ts.map