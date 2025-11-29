import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import ChannelService from '../services/channel.service';

export class ChannelController {
  /**
   * Get all channels for a team
   */
  async getTeamChannels(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { teamId } = req.params;

      const channels = await ChannelService.getTeamChannels(teamId, userId);

      res.json({ success: true, data: channels });
    } catch (error: any) {
      logger.error('Error fetching team channels', {
        error: error.message,
        teamId: req.params.teamId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch channels' });
    }
  }

  /**
   * Get channel by ID
   */
  async getChannelById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { channelId } = req.params;

      const channel = await ChannelService.getChannelById(channelId, userId);

      res.json({ success: true, data: channel });
    } catch (error: any) {
      logger.error('Error fetching channel', {
        error: error.message,
        channelId: req.params.channelId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch channel' });
    }
  }

  /**
   * Create a new channel
   */
  async createChannel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const channelData = req.body;

      const channel = await ChannelService.createChannel(userId, channelData);

      res.status(201).json({ success: true, data: channel });
    } catch (error: any) {
      logger.error('Error creating channel', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create channel' });
    }
  }

  /**
   * Update a channel
   */
  async updateChannel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { channelId } = req.params;
      const updates = req.body;

      const channel = await ChannelService.updateChannel(channelId, userId, updates);

      res.json({ success: true, data: channel });
    } catch (error: any) {
      logger.error('Error updating channel', {
        error: error.message,
        channelId: req.params.channelId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to update channel' });
    }
  }

  /**
   * Delete a channel
   */
  async deleteChannel(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { channelId } = req.params;

      await ChannelService.deleteChannel(channelId, userId);

      res.json({ success: true, data: { message: 'Channel deleted successfully' } });
    } catch (error: any) {
      logger.error('Error deleting channel', {
        error: error.message,
        channelId: req.params.channelId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to delete channel' });
    }
  }

  /**
   * Add member to private channel
   */
  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { channelId } = req.params;
      const { userId: memberUserId } = req.body;

      const channel = await ChannelService.addMember(channelId, userId, memberUserId);

      res.json({ success: true, data: channel });
    } catch (error: any) {
      logger.error('Error adding member to channel', {
        error: error.message,
        channelId: req.params.channelId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to add member to channel' });
    }
  }

  /**
   * Remove member from private channel
   */
  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { channelId, memberId } = req.params;

      const channel = await ChannelService.removeMember(channelId, userId, memberId);

      res.json({ success: true, data: channel });
    } catch (error: any) {
      logger.error('Error removing member from channel', {
        error: error.message,
        channelId: req.params.channelId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to remove member from channel' });
    }
  }
}

export default new ChannelController();
