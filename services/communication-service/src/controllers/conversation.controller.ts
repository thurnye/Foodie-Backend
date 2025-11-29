import { Request, Response } from 'express';
import { logger, Errors } from '@foodie/libs';
import ConversationService from '../services/conversation.service';

export class ConversationController {
  /**
   * Get all conversations for the current user
   */
  async getUserConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const conversations = await ConversationService.getUserConversations(userId);

      res.json({ success: true, data: conversations });
    } catch (error: any) {
      logger.error('Error fetching user conversations', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { conversationId } = req.params;

      const conversation = await ConversationService.getConversationById(
        conversationId,
        userId
      );

      res.json({ success: true, data: conversation });
    } catch (error: any) {
      logger.error('Error fetching conversation', {
        error: error.message,
        conversationId: req.params.conversationId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { participants } = req.body;

      const conversation = await ConversationService.createConversation(
        userId,
        participants
      );

      res.status(201).json({ success: true, data: conversation });
    } catch (error: any) {
      logger.error('Error creating conversation', { error: error.message });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to create conversation' });
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { conversationId } = req.params;

      await ConversationService.deleteConversation(conversationId, userId);

      res.json({ success: true, data: { message: 'Conversation deleted successfully' } });
    } catch (error: any) {
      logger.error('Error deleting conversation', {
        error: error.message,
        conversationId: req.params.conversationId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to delete conversation' });
    }
  }

  /**
   * Add participant to conversation
   */
  async addParticipant(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { conversationId } = req.params;
      const { userId: participantId } = req.body;

      const conversation = await ConversationService.addParticipant(
        conversationId,
        userId,
        participantId
      );

      res.json({ success: true, data: conversation });
    } catch (error: any) {
      logger.error('Error adding participant to conversation', {
        error: error.message,
        conversationId: req.params.conversationId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to add participant' });
    }
  }

  /**
   * Remove participant from conversation
   */
  async removeParticipant(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { conversationId, participantId } = req.params;

      const conversation = await ConversationService.removeParticipant(
        conversationId,
        userId,
        participantId
      );

      res.json({ success: true, data: conversation });
    } catch (error: any) {
      logger.error('Error removing participant from conversation', {
        error: error.message,
        conversationId: req.params.conversationId,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: 'Failed to remove participant' });
    }
  }

  /**
   * Find or create direct conversation with another user
   */
  async findOrCreateDirectConversation(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.headers['x-user-id'] as string;
      if (!userId) {
        throw Errors.unauthorized('User not authenticated');
      }

      const { otherUserId } = req.body;

      const conversation = await ConversationService.findOrCreateDirectConversation(
        userId,
        otherUserId
      );

      res.json({ success: true, data: conversation });
    } catch (error: any) {
      logger.error('Error finding or creating direct conversation', {
        error: error.message,
      });
      if (error.isOperational) {
        res.status(error.statusCode).json({ success: false, error: error.message });
        return;
      }
      res
        .status(500)
        .json({ success: false, error: 'Failed to find or create conversation' });
    }
  }
}

export default new ConversationController();
