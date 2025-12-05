import { EventWithUser, GetEventsFilters } from '../types/event.services.types';
import { SortOrder } from 'mongoose';
export declare function buildEventFilters(filters: GetEventsFilters): any;
type SortObject = Record<string, SortOrder>;
export declare function buildSortQuery(sort?: string): SortObject;
export declare function populateOrganizer(organizerId: string): Promise<string | import("../types/event.services.types").UserData | null>;
export declare function populateRegisteredAttendees(attendees: any[]): Promise<any[]>;
export declare function formatEventWithUsers(event: any): Promise<EventWithUser>;
export {};
//# sourceMappingURL=event.service.helpers.d.ts.map