import { CreateEventData, EventWithUser, GetEventsFilters, UpdateEventData } from '../types/event.services.types';
declare class EventService {
    getAllEvents(filters?: GetEventsFilters): Promise<EventWithUser[]>;
    getEventById(eventId: string): Promise<EventWithUser>;
    createEvent(userId: string, data: CreateEventData): Promise<EventWithUser>;
    updateEvent(eventId: string, userId: string, data: UpdateEventData): Promise<EventWithUser>;
    deleteEvent(eventId: string, userId: string): Promise<void>;
    registerForEvent(eventId: string, userId: string, ticketTierId: string): Promise<EventWithUser>;
    cancelRegistration(eventId: string, userId: string): Promise<EventWithUser>;
    getMyEvents(userId: string): Promise<EventWithUser[]>;
    getOrganizedEvents(userId: string, filters?: GetEventsFilters): Promise<EventWithUser[]>;
}
declare const _default: EventService;
export default _default;
//# sourceMappingURL=EventService.d.ts.map