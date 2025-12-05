import { Request, Response } from 'express';
export declare class MeetingController {
    getUserMeetings(req: Request, res: Response): Promise<void>;
    getUpcomingMeetings(req: Request, res: Response): Promise<void>;
    getMeetingById(req: Request, res: Response): Promise<void>;
    createMeeting(req: Request, res: Response): Promise<void>;
    updateMeeting(req: Request, res: Response): Promise<void>;
    deleteMeeting(req: Request, res: Response): Promise<void>;
    addParticipant(req: Request, res: Response): Promise<void>;
    removeParticipant(req: Request, res: Response): Promise<void>;
}
declare const _default: MeetingController;
export default _default;
//# sourceMappingURL=meeting.controller.d.ts.map