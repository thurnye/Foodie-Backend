import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import { Event } from '../models/Event.model';
import {
  CreateEventData,
  EventWithUser,
  GetEventsFilters,
  UpdateEventData,
} from '../types/event.services.types';
import { buildEventFilters, buildSortQuery, formatEventWithUsers } from '../utils/event.service.helpers';



class EventService {
  /**
   * Get all events with filters
   */
  async getAllEvents(filters: GetEventsFilters = {}): Promise<EventWithUser[]> {
    try {
      const { sort = 'upcoming', page = 1, limit = 20 } = filters;

      const query = buildEventFilters(filters);
      const sortQuery = buildSortQuery(sort);

      const events = await Event.find(query)
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return Promise.all(events.map(formatEventWithUsers));
    } catch (error) {
      logger.error(`Error getting all events: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<EventWithUser> {
    try {
      const event = await Event.findById(eventId).lean();

      if (!event) throw Errors.notFound('Event not found');

      return await formatEventWithUsers(event);
    } catch (error) {
      logger.error(`Error fetching event: ${error}`);
      throw Errors.internalServer();
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
      const event = new Event({ ...data, organizer: userId });
      await event.save();

      const eventObj = event.toObject();
      return await formatEventWithUsers(eventObj);
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

      if (!event) throw Errors.notFound('Event not found');
      if (event.organizer.toString() !== userId)
        throw Errors.forbidden('Only organizer can update event');

      Object.assign(event, data);
      await event.save();

      return await formatEventWithUsers(event.toObject());
    } catch (error) {
      logger.error(`Error updating event: ${error}`);
      throw error;
    }
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    try {
      const event = await Event.findById(eventId);

      if (!event) throw Errors.notFound('Event not found');
      if (event.organizer.toString() !== userId)
        throw Errors.forbidden('Only organizer can delete');

      await Event.findByIdAndDelete(eventId);
    } catch (error) {
      logger.error(`Error deleting event: ${error}`);
      throw error;
    }
  }

  /**
   * Register for event
   */
  async registerForEvent(
    eventId: string,
    userId: string,
    ticketTierId: string
  ): Promise<EventWithUser> {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw Errors.notFound('Event not found');

      /** --- VALIDATIONS (unchanged) --- */
      if (event.status !== 'published')
        throw Errors.badRequest('Cannot register for unpublished event');

      if (new Date(event.endDate) < new Date())
        throw Errors.badRequest('Cannot register for past event');

      const existing = event.attendees.find(
        a => a.user.toString() === userId
      );

      // Register or re-register logic
      if (!existing) {
        if (event.attendeeCount >= event.capacity)
          throw Errors.badRequest('Event is full');

        const tier = event.ticketTiers.find(
          t => t._id?.toString() === ticketTierId
        );
        if (!tier) throw Errors.notFound('Ticket tier not found');

        if (tier.quantitySold >= tier.quantity)
          throw Errors.badRequest('Ticket tier is sold out');

        const now = new Date();
        if (now < new Date(tier.salesStartDate) || now > new Date(tier.salesEndDate))
          throw Errors.badRequest('Ticket sales not open');

        event.attendees.push({
          user: new Types.ObjectId(userId),
          ticketTier: tier.name,
          registeredAt: new Date(),
          attendanceStatus: 'registered',
        });
        tier.quantitySold += 1;
      } else if (existing.attendanceStatus === 'cancelled') {
        existing.attendanceStatus = 'registered';
        existing.registeredAt = new Date();

        const tier = event.ticketTiers.find(t => t.name === existing.ticketTier);
        if (tier) tier.quantitySold += 1;
      }

      await event.save();

      return await formatEventWithUsers(event.toObject());
    } catch (error) {
      logger.error(`Error registering for event: ${error}`);
      throw error;
    }
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(eventId: string, userId: string): Promise<EventWithUser> {
    try {
      const event = await Event.findById(eventId);
      if (!event) throw Errors.notFound('Event not found');

      const attendee = event.attendees.find(
        a => a.user.toString() === userId && a.attendanceStatus !== 'cancelled'
      );

      if (!attendee) throw Errors.notFound('Registration not found');

      attendee.attendanceStatus = 'cancelled';

      const tier = event.ticketTiers.find(t => t.name === attendee.ticketTier);
      if (tier) tier.quantitySold = Math.max(0, tier.quantitySold - 1);

      await event.save();

      return await formatEventWithUsers(event.toObject());
    } catch (error) {
      logger.error(`Error cancelling: ${error}`);
      throw error;
    }
  }

  /**
   * Get events user registered for
   */
  async getMyEvents(userId: string): Promise<EventWithUser[]> {
    try {
      const events = await Event.find({
        'attendees.user': userId,
        'attendees.attendanceStatus': { $ne: 'cancelled' },
      }).lean();

      return Promise.all(events.map(formatEventWithUsers));
    } catch (error) {
      logger.error(`Error getting my events: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get events organized by the user
   */
  async getOrganizedEvents(
    userId: string,
    filters: GetEventsFilters = {}
  ): Promise<EventWithUser[]> {
    try {
      const { sort = 'upcoming', page = 1, limit = 20 } = filters;

      const query = buildEventFilters(filters);
      const sortQuery = buildSortQuery(sort);

      const events = await Event.find({ organizer: userId, ...query })
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      return Promise.all(events.map(formatEventWithUsers));
    } catch (error) {
      logger.error(`Error getting organized events: ${error}`);
      throw Errors.internalServer();
    }
  }
}

export default new EventService();
