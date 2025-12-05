import { Request, Response } from 'express';
export declare class MessageController {
    getChannelMessages(req: Request, res: Response): Promise<void>;
    getConversationMessages(req: Request, res: Response): Promise<void>;
    getMessageById(req: Request, res: Response): Promise<void>;
    createMessage(req: Request, res: Response): Promise<void>;
    updateMessage(req: Request, res: Response): Promise<void>;
    deleteMessage(req: Request, res: Response): Promise<void>;
    addReaction(req: Request, res: Response): Promise<void>;
}
declare const _default: MessageController;
export default _default;
//# sourceMappingURL=message.controller.d.ts.map