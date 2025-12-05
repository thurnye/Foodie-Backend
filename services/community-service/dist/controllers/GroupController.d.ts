import { Request, Response } from 'express';
export declare class GroupController {
    getAllGroups(req: Request, res: Response): Promise<void>;
    getGroupById(req: Request, res: Response): Promise<void>;
    createGroup(req: Request, res: Response): Promise<void>;
    updateGroup(req: Request, res: Response): Promise<void>;
    deleteGroup(req: Request, res: Response): Promise<void>;
    joinGroup(req: Request, res: Response): Promise<void>;
    leaveGroup(req: Request, res: Response): Promise<void>;
    getMyGroups(req: Request, res: Response): Promise<void>;
    cancelJoinRequest(req: Request, res: Response): Promise<void>;
    approveJoinRequest(req: Request, res: Response): Promise<void>;
    rejectJoinRequest(req: Request, res: Response): Promise<void>;
}
declare const _default: GroupController;
export default _default;
//# sourceMappingURL=GroupController.d.ts.map