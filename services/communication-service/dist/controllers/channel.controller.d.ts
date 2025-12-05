import { Request, Response } from 'express';
export declare class ChannelController {
    getTeamChannels(req: Request, res: Response): Promise<void>;
    getChannelById(req: Request, res: Response): Promise<void>;
    createChannel(req: Request, res: Response): Promise<void>;
    updateChannel(req: Request, res: Response): Promise<void>;
    deleteChannel(req: Request, res: Response): Promise<void>;
    addMember(req: Request, res: Response): Promise<void>;
    removeMember(req: Request, res: Response): Promise<void>;
}
declare const _default: ChannelController;
export default _default;
//# sourceMappingURL=channel.controller.d.ts.map