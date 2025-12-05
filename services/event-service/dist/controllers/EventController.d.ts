import { Request, Response } from 'express';
export declare class EventController {
    getAllEvents(req: Request, res: Response): Promise<void>;
    getEventById(req: Request, res: Response): Promise<void>;
    createEvent(req: Request, res: Response): Promise<void>;
    updateEvent(req: Request, res: Response): Promise<void>;
    deleteEvent(req: Request, res: Response): Promise<void>;
    registerForEvent(req: Request, res: Response): Promise<void>;
    cancelRegistration(req: Request, res: Response): Promise<void>;
    getMyEvents(req: Request, res: Response): Promise<void>;
    getOrganizedEvents(req: Request, res: Response): Promise<void>;
}
declare const _default: EventController;
export default _default;
//# sourceMappingURL=EventController.d.ts.map