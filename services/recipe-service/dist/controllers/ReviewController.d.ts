import { Request, Response, NextFunction } from 'express';
export declare const addReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReviewsForRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteReview: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserReviewForRecipe: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReviewsWithReplies: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleReviewLike: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleReviewReaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createReply: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleReplyLike: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleReplyReaction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=ReviewController.d.ts.map