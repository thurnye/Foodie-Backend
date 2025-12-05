import { Request, Response } from 'express';
export declare class PostController {
    getAllPosts(req: Request, res: Response): Promise<void>;
    getPostById(req: Request, res: Response): Promise<void>;
    createPost(req: Request, res: Response): Promise<void>;
    updatePost(req: Request, res: Response): Promise<void>;
    deletePost(req: Request, res: Response): Promise<void>;
    votePost(req: Request, res: Response): Promise<void>;
    removeVote(req: Request, res: Response): Promise<void>;
    reactToPost(req: Request, res: Response): Promise<void>;
    removeReaction(req: Request, res: Response): Promise<void>;
    sharePost(req: Request, res: Response): Promise<void>;
}
declare const _default: PostController;
export default _default;
//# sourceMappingURL=PostController.d.ts.map