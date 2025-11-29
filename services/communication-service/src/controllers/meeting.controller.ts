import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import MeetingService from '../services/meeting.service';

export class MeetingController {
  /**
   * Get all meetings for the current user
   */
  async getUserMeetings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { status, startDate, endDate } = req.query;

      const meetings = await MeetingService.getUserMeetings(userId, {
        status: status as any,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json({ success: true, data: meetings });
    } catch (error: any) {
      logger.error('Error fetching user meetings', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch meetings' });
    }
  }

  /**
   * Get upcoming meetings for the current user
   */
  async getUpcomingMeetings(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const meetings = await MeetingService.getUpcomingMeetings(userId);

      res.json({ success: true, data: meetings });
    } catch (error: any) {
      logger.error('Error fetching upcoming meetings', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch upcoming meetings' });
    }
  }

  /**
   * Get meeting by ID
   */
  async getMeetingById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { meetingId } = req.params;

      const meeting = await MeetingService.getMeetingById(meetingId, userId);

      res.json({ success: true, data: meeting });
    } catch (error: any) {
      logger.error('Error fetching meeting', {
        error: error.message,
        meetingId: req.params.meetingId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch meeting' });
    }
  }

  /**
   * Create a new meeting
   */
  async createMeeting(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const meetingData = req.body;

      const meeting = await MeetingService.createMeeting(userId, meetingData);

      res.status(201).json({ success: true, data: meeting });
    } catch (error: any) {
      logger.error('Error creating meeting', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create meeting' });
    }
  }

  /**
   * Update a meeting
   */
  async updateMeeting(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { meetingId } = req.params;
      const updates = req.body;

      const meeting = await MeetingService.updateMeeting(meetingId, userId, updates);

      res.json({ success: true, data: meeting });
    } catch (error: any) {
      logger.error('Error updating meeting', {
        error: error.message,
        meetingId: req.params.meetingId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to update meeting' });
    }
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { meetingId } = req.params;

      await MeetingService.deleteMeeting(meetingId, userId);

      res.json({ success: true, data: { message: 'Meeting deleted successfully' } });
    } catch (error: any) {
      logger.error('Error deleting meeting', {
        error: error.message,
        meetingId: req.params.meetingId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to delete meeting' });
    }
  }

  /**
   * Add participant to meeting
   */
  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { meetingId } = req.params;
      const { userId: participantId } = req.body;

      const meeting = await MeetingService.addParticipant(
        meetingId,
        userId,
        participantId
      );

      res.json({ success: true, data: meeting });
    } catch (error: any) {
      logger.error('Error adding participant to meeting', {
        error: error.message,
        meetingId: req.params.meetingId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to add participant' });
    }
  }

  /**
   * Remove participant from meeting
   */
  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { meetingId, participantId } = req.params;

      const meeting = await MeetingService.removeParticipant(
        meetingId,
        userId,
        participantId
      );

      res.json({ success: true, data: meeting });
    } catch (error: any) {
      logger.error('Error removing participant from meeting', {
        error: error.message,
        meetingId: req.params.meetingId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to remove participant' });
    }
  }
}

export default new MeetingController();
