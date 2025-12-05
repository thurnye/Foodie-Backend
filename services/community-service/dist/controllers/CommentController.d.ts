import { Request, Response } from 'express';
export declare class CommentController {
    getCommentsByPost(req: Request, res: Response): Promise<void>;
    createComment(req: Request, res: Response): Promise<void>;
    updateComment(req: Request, res: Response): Promise<void>;
    deleteComment(req: Request, res: Response): Promise<void>;
    voteComment(req: Request, res: Response): Promise<void>;
    removeVote(req: Request, res: Response): Promise<void>;
    reactToComment(req: Request, res: Response): Promise<void>;
    removeReaction(req: Request, res: Response): Promise<void>;
}
declare const _default: CommentController;
export default _default;
//# sourceMappingURL=CommentController.d.ts.map