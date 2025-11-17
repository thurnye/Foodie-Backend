import { Request, Response, NextFunction } from 'express';
export declare const createCookbook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCookbookById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyCookbooks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPublicCookbooks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCookbook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteCookbook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateCookbook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCookbookStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addExtraPage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateExtraPage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteExtraPage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=CookbookController.d.ts.map