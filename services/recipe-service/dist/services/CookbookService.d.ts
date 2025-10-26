export declare class CookbookService {
    generateCookbook(userId: string): Promise<{
        url: string;
        pdfId: string;
    }>;
    getCookbookStatus(pdfId: string): Promise<{
        status: string;
        url?: string;
    }>;
}
declare const _default: CookbookService;
export default _default;
//# sourceMappingURL=CookbookService.d.ts.map