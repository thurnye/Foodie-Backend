import { Request, Response } from 'express';
export declare class ConversationController {
    getUserConversations(req: Request, res: Response): Promise<void>;
    getConversationById(req: Request, res: Response): Promise<void>;
    createConversation(req: Request, res: Response): Promise<void>;
    deleteConversation(req: Request, res: Response): Promise<void>;
    addParticipant(req: Request, res: Response): Promise<void>;
    removeParticipant(req: Request, res: Response): Promise<void>;
    findOrCreateDirectConversation(req: Request, res: Response): Promise<void>;
}
declare const _default: ConversationController;
export default _default;
//# sourceMappingURL=conversation.controller.d.ts.map