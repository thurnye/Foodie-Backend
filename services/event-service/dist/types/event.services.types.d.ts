import { Document, Types } from "mongoose";
export interface UserData {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    bio?: string;
}
export interface IEventLocation {
    type: 'venue' | 'online';
    venueName?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    onlineUrl?: string;
    latitude?: number;
    longitude?: number;
}
export interface ITicketTier {
    _id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    quantitySold: number;
    salesStartDate: Date;
    salesEndDate: Date;
}
export interface IEventImage {
    url: string;
    alt?: string;
    isCover?: boolean;
}
export interface IAttendee {
    user: Types.ObjectId;
    ticketTier: string;
    registeredAt: Date;
    attendanceStatus: 'registered' | 'checked-in' | 'cancelled';
}
export interface IEvent extends Document {
    title: string;
    description: string;
    organizer: Types.ObjectId;
    category: string;
    tags: string[];
    startDate: Date;
    endDate: Date;
    location: IEventLocation;
    images: IEventImage[];
    ticketTiers: ITicketTier[];
    capacity: number;
    attendeeCount: number;
    attendees: IAttendee[];
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    isPublic: boolean;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateEventData {
    title: string;
    description: string;
    category: string;
    tags: string[];
    startDate: Date | string;
    endDate: Date | string;
    location: IEventLocation;
    images: IEventImage[];
    ticketTiers: ITicketTier[];
    capacity: number;
    status: 'draft' | 'published';
    isPublic: boolean;
}
export interface UpdateEventData {
    title?: string;
    description?: string;
    category?: string;
    tags?: string[];
    startDate?: Date | string;
    endDate?: Date | string;
    location?: IEventLocation;
    images?: IEventImage[];
    ticketTiers?: ITicketTier[];
    capacity?: number;
    status?: 'draft' | 'published' | 'cancelled' | 'completed';
    isPublic?: boolean;
}
export interface GetEventsFilters {
    category?: string;
    tags?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    search?: string;
    sort?: 'newest' | 'oldest' | 'popular' | 'upcoming';
    page?: number;
    limit?: number;
}
export interface EventWithUser {
    _id: any;
    title: string;
    description: string;
    organizer: UserData | null;
    category: string;
    tags: string[];
    startDate: Date;
    endDate: Date;
    location: IEventLocation;
    images: IEventImage[];
    ticketTiers: ITicketTier[];
    capacity: number;
    attendeeCount: number;
    attendees: Array<{
        user: UserData | Types.ObjectId | null;
        ticketTier: string;
        registeredAt: Date;
        attendanceStatus: 'registered' | 'checked-in' | 'cancelled';
    }>;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    isPublic: boolean;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=event.services.types.d.ts.map