import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import EventService from '../services/EventService';

export class EventController {
  /**
   * Get all events with filters
   */
  async getAllEvents(req: Request, res: Response) {
    try {
      const {
        search,
        category,
        tags,
        location,
        startDate,
        endDate,
        status,
        sort,
        page,
        limit,
      } = req.query;

      const events = await EventService.getAllEvents({
        search: search as string,
        category: category as string,
        tags: tags as string,
        location: location as string,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        sort: sort as 'newest' | 'oldest' | 'popular' | 'upcoming',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({ success: true, data: events });
    } catch (error: any) {
      logger.error('Error fetching events', { error: error.message });
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch events' });
    }
  }

  /**
   * Get event by ID
   */
  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = req.headers['x-user-id'] as string;

      const event = await EventService.getEventById(eventId, userId);

      res.json({ success: true, data: event });
    } catch (error: any) {
      logger.error('Error fetching event', {
        error: error.message,
        eventId: req.params.eventId,
      });
      if (error.isOperational) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch event' });
    }
  }

  /**
   * Create a new event
   */
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const eventData = req.body;

      const event = await EventService.createEvent(userId, eventData);

      res.status(201).json({ success: true, data: event });
    } catch (error: any) {
      logger.error('Error creating event', { error: error.message });
      if (error.isOperational) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: 'Failed to create event' });
    }
  }

  /**
   * Update an event
   */
  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { eventId } = req.params;
      const updates = req.body;

      const event = await EventService.updateEvent(eventId, userId, updates);

      res.json({ success: true, data: event });
    } catch (error: any) {
      logger.error('Error updating event', {
        error: error.message,
        eventId: req.params.eventId,
      });
      if (error.isOperational) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: 'Failed to update event' });
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { eventId } = req.params;

      await EventService.deleteEvent(eventId, userId);

      res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error: any) {
      logger.error('Error deleting event', {
        error: error.message,
        eventId: req.params.eventId,
      });
      if (error.isOperational) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: 'Failed to delete event' });
    }
  }

  /**
   * Register for an event
   */
  async registerForEvent(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { eventId } = req.params;
      const { ticketTierId } = req.body;

      const event = await EventService.registerForEvent(
        eventId,
        userId,
        ticketTierId
      );

      res.json({ success: true, data: event });
    } catch (error: any) {
      logger.error('Error registering for event', {
        error: error.message,
        eventId: req.params.eventId,
      });
      if (error.isOperational) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: 'Failed to register for event' });
    }
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { eventId } = req.params;

      const event = await EventService.cancelRegistration(eventId, userId);

      res.json({ success: true, data: event });
    } catch (error: any) {
      logger.error('Error cancelling registration', {
        error: error.message,
        eventId: req.params.eventId,
      });
      if (error.isOperational) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: 'Failed to cancel registration' });
    }
  }

  /**
   * Get user's registered events
   */
  async getMyEvents(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const events = await EventService.getMyEvents(userId);

      res.json({ success: true, data: events });
    } catch (error: any) {
      logger.error('Error fetching user events', { error: error.message });
      if (error.isOperational) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch your events' });
    }
  }

  /**
   * Get events organized by user
   */
  async getOrganizedEvents(req: Request, res: Response): Promise<void> {
    try {
      const {
        search,
        category,
        tags,
        location,
        startDate,
        endDate,
        status,
        sort,
        page,
        limit,
      } = req.query;

      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const events = await EventService.getOrganizedEvents(
        userId,
        {search: search as string,
        category: category as string,
        tags: tags as string,
        location: location as string,
        startDate: startDate as string,
        endDate: endDate as string,
        status: status as string,
        sort: sort as 'newest' | 'oldest' | 'popular' | 'upcoming',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,}
      );

      res.json({ success: true, data: events });
    } catch (error: any) {
      logger.error('Error fetching organized events', { error: error.message });
      if (error.isOperational) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: 'Failed to fetch organized events' });
    }
  }
}

export default new EventController();
