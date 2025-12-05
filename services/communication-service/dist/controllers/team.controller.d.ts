import { Request, Response } from 'express';
export declare class TeamController {
    getUserTeams(req: Request, res: Response): Promise<void>;
    getTeamById(req: Request, res: Response): Promise<void>;
    createTeam(req: Request, res: Response): Promise<void>;
    updateTeam(req: Request, res: Response): Promise<void>;
    deleteTeam(req: Request, res: Response): Promise<void>;
    addMember(req: Request, res: Response): Promise<void>;
    removeMember(req: Request, res: Response): Promise<void>;
    inviteMemberByEmail(req: Request, res: Response): Promise<void>;
}
declare const _default: TeamController;
export default _default;
//# sourceMappingURL=team.controller.d.ts.map