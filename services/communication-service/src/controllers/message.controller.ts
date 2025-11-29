import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import MessageService from '../services/message.service';

export class MessageController {
  /**
   * Get messages for a channel
   */
  async getChannelMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { channelId } = req.params;
      const { page, limit } = req.query;

      const messages = await MessageService.getChannelMessages(
        channelId,
        userId,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({ success: true, data: messages });
    } catch (error: any) {
      logger.error('Error fetching channel messages', {
        error: error.message,
        channelId: req.params.channelId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { conversationId } = req.params;
      const { page, limit } = req.query;

      const messages = await MessageService.getConversationMessages(
        conversationId,
        userId,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({ success: true, data: messages });
    } catch (error: any) {
      logger.error('Error fetching conversation messages', {
        error: error.message,
        conversationId: req.params.conversationId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { messageId } = req.params;

      const message = await MessageService.getMessageById(messageId, userId);

      res.json({ success: true, data: message });
    } catch (error: any) {
      logger.error('Error fetching message', {
        error: error.message,
        messageId: req.params.messageId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch message' });
    }
  }

  /**
   * Create a new message
   */
  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const messageData = req.body;

      const message = await MessageService.createMessage(userId, messageData);

      res.status(201).json({ success: true, data: message });
    } catch (error: any) {
      logger.error('Error creating message', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create message' });
    }
  }

  /**
   * Update a message
   */
  async updateMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { messageId } = req.params;
      const updates = req.body;

      const message = await MessageService.updateMessage(messageId, userId, updates);

      res.json({ success: true, data: message });
    } catch (error: any) {
      logger.error('Error updating message', {
        error: error.message,
        messageId: req.params.messageId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to update message' });
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { messageId } = req.params;

      await MessageService.deleteMessage(messageId, userId);

      res.json({ success: true, data: { message: 'Message deleted successfully' } });
    } catch (error: any) {
      logger.error('Error deleting message', {
        error: error.message,
        messageId: req.params.messageId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to delete message' });
    }
  }

  /**
   * Add reaction to a message
   */
  async addReaction(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { messageId } = req.params;
      const { emoji } = req.body;

      const message = await MessageService.addReaction(messageId, userId, emoji);

      res.json({ success: true, data: message });
    } catch (error: any) {
      logger.error('Error adding reaction to message', {
        error: error.message,
        messageId: req.params.messageId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to add reaction' });
    }
  }
}

export default new MessageController();
