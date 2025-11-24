import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import {
  Event,
  IEvent,
  IEventLocation,
  ITicketTier,
  IEventImage,
} from '../models/Event.model';
import { fetchUserData, UserData } from '../utils/userClient';

interface CreateEventData {
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

interface UpdateEventData {
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

interface GetEventsFilters {
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

interface EventWithUser {
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

class EventService {
  /**
   * Get all events with filters
   */
  async getAllEvents(filters: GetEventsFilters = {}): Promise<EventWithUser[]> {
    try {
      const {
        search,
        category,
        tags,
        location,
        startDate,
        endDate,
        status='published',
        sort = 'upcoming',
        page = 1,
        limit = 20,
      } = filters;

      let query: any = {};

      // Search filter
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Category filter
      if (category) {
        query.category = category;
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',');
        query.tags = { $in: tagArray };
      }

      // Location filter
      if (location) {
        query.$or = [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.venueName': { $regex: location, $options: 'i' } },
        ];
      }

      // Date filters
      if (startDate) {
        query.startDate = { $gte: new Date(startDate) };
      }
      if (endDate) {
        query.endDate = { $lte: new Date(endDate) };
      }

      // Status filter
      if (status) {
        query.status = status;
      }

      // Sorting
      let sortQuery: any = {};
      switch (sort) {
        case 'popular':
          sortQuery = { attendeeCount: -1, startDate: 1 };
          break;
        case 'oldest':
          sortQuery = { createdAt: 1 };
          break;
        case 'upcoming':
          sortQuery = { startDate: 1 };
          break;
        default: // newest
          sortQuery = { createdAt: -1 };
      }

      const skip = (page - 1) * limit;

      const events = await Event.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();

      // Fetch user data for organizers and attendees
      const eventsWithUsers = await Promise.all(
        events.map(async (event) => {
          try {
            if (event) {
              const organizerData = await fetchUserData(
                event.organizer._id.toString()
              );

              const attendeesWithUsers = await Promise.all(
                event.attendees.map(async (attendee) => {
                  try {
                    const attendeeUserData = await fetchUserData(
                      attendee.user.toString()
                    );
                    return {
                      ...attendee,
                      user: attendeeUserData,
                    };
                  } catch (error) {
                    logger.error(
                      `Failed to fetch attendee user data: ${error}`
                    );
                    return attendee;
                  }
                })
              );

              return {
                ...event,
                organizer: organizerData,
                attendees: attendeesWithUsers,
              };
            }
          } catch (error) {
            logger.error(`Failed to fetch organizer data: ${error}`);
            return event as any;
          }
        })
      );

      return eventsWithUsers;
    } catch (error) {
      logger.error(`Error getting all events: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string, userId?: string): Promise<EventWithUser> {
    try {
      const event = await Event.findById(eventId).lean();

      if (!event) {
        throw Errors.notFound('Event not found');
      }

      // Fetch organizer data
      const organizerData = await fetchUserData(event.organizer.toString());

      // Fetch attendees data
      const attendeesWithUsers = await Promise.all(
        event.attendees.map(async (attendee) => {
          try {
            const attendeeUserData = await fetchUserData(
              attendee.user.toString()
            );
            return {
              ...attendee,
              user: attendeeUserData,
            };
          } catch (error) {
            logger.error(`Failed to fetch attendee user data: ${error}`);
            return attendee;
          }
        })
      );

      return {
        ...event,
        organizer: organizerData,
        attendees: attendeesWithUsers,
      };
    } catch (error) {
      logger.error(`Error getting event by ID: ${error}`);
      if (error instanceof Error && error.name === 'CastError') {
        throw Errors.badRequest('Invalid event ID');
      }
      throw error;
    }
  }

  /**
   * Create a new event
   */
  async createEvent(
    userId: string,
    data: CreateEventData
  ): Promise<EventWithUser> {
    try {
      const event = new Event({
        ...data,
        organizer: userId,
      });

      await event.save();

      const organizerData = await fetchUserData(userId);

      return {
        ...event.toObject(),
        organizer: organizerData,
      };
    } catch (error) {
      logger.error(`Error creating event: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw Errors.badRequest(error.message);
      }
      throw Errors.internalServer();
    }
  }

  /**
   * Update an event
   */
  async updateEvent(
    eventId: string,
    userId: string,
    data: UpdateEventData
  ): Promise<EventWithUser> {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw Errors.notFound('Event not found');
      }

      // Check if user is the organizer
      if (event.organizer.toString() !== userId) {
        throw Errors.forbidden('Only the organizer can update the event');
      }

      // Update fields
      Object.assign(event, data);

      await event.save();

      const organizerData = await fetchUserData(userId);

      const attendeesWithUsers = await Promise.all(
        event.attendees.map(async (attendee) => {
          try {
            const attendeeUserData = await fetchUserData(
              attendee.user.toString()
            );
            return {
              ...attendee,
              user: attendeeUserData,
            };
          } catch (error) {
            logger.error(`Failed to fetch attendee user data: ${error}`);
            return attendee;
          }
        })
      );

      return {
        ...event.toObject(),
        organizer: organizerData,
        attendees: attendeesWithUsers,
      };
    } catch (error) {
      logger.error(`Error updating event: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw Errors.badRequest(error.message);
      }
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw Errors.notFound('Event not found');
      }

      // Check if user is the organizer
      if (event.organizer.toString() !== userId) {
        throw Errors.forbidden('Only the organizer can delete the event');
      }

      await Event.findByIdAndDelete(eventId);
    } catch (error) {
      logger.error(`Error deleting event: ${error}`);
      throw error;
    }
  }

  /**
   * Register for an event
   */
  async registerForEvent(
    eventId: string,
    userId: string,
    ticketTierId: string
  ): Promise<EventWithUser> {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw Errors.notFound('Event not found');
      }

      // Check if event is published
      if (event.status !== 'published') {
        throw Errors.badRequest('Cannot register for unpublished event');
      }

      // Check if event has ended
      if (new Date(event.endDate) < new Date()) {
        throw Errors.badRequest('Cannot register for past event');
      }

      // Check if already registered
      const alreadyRegistered = event.attendees.some(
        (attendee) =>
          attendee.user.toString() === userId &&
          attendee.attendanceStatus !== 'cancelled'
      );

      if (alreadyRegistered) {
        throw Errors.badRequest('Already registered for this event');
      }

      // Check if event is full
      if (event.attendeeCount >= event.capacity) {
        throw Errors.badRequest('Event is full');
      }

      // Find the ticket tier
      const ticketTier = event.ticketTiers.find(
        (tier) => tier._id?.toString() === ticketTierId
      );

      if (!ticketTier) {
        throw Errors.notFound('Ticket tier not found');
      }

      // Check if ticket tier is available
      if (ticketTier.quantitySold >= ticketTier.quantity) {
        throw Errors.badRequest('Ticket tier is sold out');
      }

      // Check if within sales period
      const now = new Date();
      if (
        now < new Date(ticketTier.salesStartDate) ||
        now > new Date(ticketTier.salesEndDate)
      ) {
        throw Errors.badRequest('Ticket sales not available at this time');
      }

      // Add attendee
      event.attendees.push({
        user: new Types.ObjectId(userId),
        ticketTier: ticketTier.name,
        registeredAt: new Date(),
        attendanceStatus: 'registered',
      });

      // Update ticket tier sold count
      ticketTier.quantitySold += 1;

      await event.save();

      const organizerData = await fetchUserData(event.organizer.toString());

      const attendeesWithUsers = await Promise.all(
        event.attendees.map(async (attendee) => {
          try {
            const attendeeUserData = await fetchUserData(
              attendee.user.toString()
            );
            return {
              ...attendee,
              user: attendeeUserData,
            };
          } catch (error) {
            logger.error(`Failed to fetch attendee user data: ${error}`);
            return attendee;
          }
        })
      );

      return {
        ...event.toObject(),
        organizer: organizerData,
        attendees: attendeesWithUsers,
      };
    } catch (error) {
      logger.error(`Error registering for event: ${error}`);
      throw error;
    }
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(
    eventId: string,
    userId: string
  ): Promise<EventWithUser> {
    try {
      const event = await Event.findById(eventId);

      if (!event) {
        throw Errors.notFound('Event not found');
      }

      // Find the attendee
      const attendee = event.attendees.find(
        (a) =>
          a.user.toString() === userId && a.attendanceStatus !== 'cancelled'
      );

      if (!attendee) {
        throw Errors.notFound('Registration not found');
      }

      // Update attendance status
      attendee.attendanceStatus = 'cancelled';

      // Decrease ticket tier sold count
      const ticketTier = event.ticketTiers.find(
        (tier) => tier.name === attendee.ticketTier
      );
      if (ticketTier) {
        ticketTier.quantitySold = Math.max(0, ticketTier.quantitySold - 1);
      }

      await event.save();

      const organizerData = await fetchUserData(event.organizer.toString());

      const attendeesWithUsers = await Promise.all(
        event.attendees.map(async (attendee) => {
          try {
            const attendeeUserData = await fetchUserData(
              attendee.user.toString()
            );
            return {
              ...attendee,
              user: attendeeUserData,
            };
          } catch (error) {
            logger.error(`Failed to fetch attendee user data: ${error}`);
            return attendee;
          }
        })
      );

      return {
        ...event.toObject(),
        organizer: organizerData,
        attendees: attendeesWithUsers,
      };
    } catch (error) {
      logger.error(`Error cancelling registration: ${error}`);
      throw error;
    }
  }

  /**
   * Get user's registered events
   */
  async getMyEvents(userId: string): Promise<EventWithUser[]> {
    try {
      const events = await Event.find({
        'attendees.user': userId,
        'attendees.attendanceStatus': { $ne: 'cancelled' },
      }).lean();

      const eventsWithUsers = await Promise.all(
        events.map(async (event) => {
          try {
            const organizerData = await fetchUserData(
              event.organizer.toString()
            );

            const attendeesWithUsers = await Promise.all(
              event.attendees.map(async (attendee) => {
                try {
                  const attendeeUserData = await fetchUserData(
                    attendee.user.toString()
                  );
                  return {
                    ...attendee,
                    user: attendeeUserData,
                  };
                } catch (error) {
                  logger.error(`Failed to fetch attendee user data: ${error}`);
                  return attendee;
                }
              })
            );

            return {
              ...event,
              organizer: organizerData,
              attendees: attendeesWithUsers,
            };
          } catch (error) {
            logger.error(`Failed to fetch organizer data: ${error}`);
            return event as any;
          }
        })
      );

      return eventsWithUsers;
    } catch (error) {
      logger.error(`Error getting user's events: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get events organized by user
   */
  async getOrganizedEvents(
    userId: string,
    filters: GetEventsFilters = {}
  ): Promise<EventWithUser[]> {
    try {
      const {
        search,
        category,
        tags,
        location,
        startDate,
        endDate,
        status,
        sort = 'upcoming',
        page = 1,
        limit = 20,
      } = filters;

      let query: any = {};

      // Search filter
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Category filter
      if (category) {
        query.category = category;
      }

      // Tags filter
      if (tags) {
        const tagArray = tags.split(',');
        query.tags = { $in: tagArray };
      }

      // Location filter
      if (location) {
        query.$or = [
          { 'location.city': { $regex: location, $options: 'i' } },
          { 'location.venueName': { $regex: location, $options: 'i' } },
        ];
      }

      // Date filters
      if (startDate) {
        query.startDate = { $gte: new Date(startDate) };
      }
      if (endDate) {
        query.endDate = { $lte: new Date(endDate) };
      }

      // Status filter
      if (status) {
        query.status = status;
      }

      // Sorting
      let sortQuery: any = {};
      switch (sort) {
        case 'popular':
          sortQuery = { attendeeCount: -1, startDate: 1 };
          break;
        case 'oldest':
          sortQuery = { createdAt: 1 };
          break;
        case 'upcoming':
          sortQuery = { startDate: 1 };
          break;
        default: // newest
          sortQuery = { createdAt: -1 };
      }

      const skip = (page - 1) * limit;

      const events = await Event.find({ organizer: userId, ...query })
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();

      const eventsWithUsers = await Promise.all(
        events.map(async (event) => {
          try {
            const organizerData = await fetchUserData(userId);

            const attendeesWithUsers = await Promise.all(
              event.attendees.map(async (attendee) => {
                try {
                  const attendeeUserData = await fetchUserData(
                    attendee.user.toString()
                  );
                  return {
                    ...attendee,
                    user: attendeeUserData,
                  };
                } catch (error) {
                  logger.error(`Failed to fetch attendee user data: ${error}`);
                  return attendee;
                }
              })
            );

            return {
              ...event,
              organizer: organizerData,
              attendees: attendeesWithUsers,
            };
          } catch (error) {
            logger.error(`Failed to fetch organizer data: ${error}`);
            return event as any;
          }
        })
      );

      return eventsWithUsers;
    } catch (error) {
      logger.error(`Error getting organized events: ${error}`);
      throw Errors.internalServer();
    }
  }
}

export default new EventService();
