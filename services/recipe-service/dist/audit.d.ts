export declare const auditLog: {
    recipeCreated: (recipeId: string, userId: string, recipeName: string) => void;
    recipeUpdated: (recipeId: string, userId: string) => void;
    recipeDeleted: (recipeId: string, userId: string) => void;
    reviewCreated: (reviewId: string, recipeId: string, userId: string, rating: number) => void;
    cookbookGenerated: (userId: string, pdfId: string) => void;
};
//# sourceMappingURL=audit.d.ts.map