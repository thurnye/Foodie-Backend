import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import { Conversation, Message } from '../models';

class ConversationService {
  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<any[]> {
    try {
      const conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'name email avatar')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .lean();

      return conversations;
    } catch (error) {
      logger.error(`Error getting user conversations: ${error}`);
      throw Errors.internalServer();
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId: string, userId: string): Promise<any> {
    try {
      const conversation = await Conversation.findById(conversationId)
        .populate('participants', 'name email avatar')
        .populate('lastMessage')
        .lean();

      if (!conversation) throw Errors.notFound('Conversation not found');

      // Check if user is a participant
      const isParticipant = conversation.participants.some(
        (p: any) => p._id.toString() === userId
      );
      if (!isParticipant)
        throw Errors.forbidden('You are not a participant in this conversation');

      return conversation;
    } catch (error) {
      logger.error(`Error fetching conversation: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new conversation or get existing one
   */
  async createConversation(
    userId: string,
    participantIds: string[]
  ): Promise<any> {
    try {
      // Add the current user to participants if not already included
      const allParticipants = Array.from(
        new Set([userId, ...participantIds])
      ).map((id) => new Types.ObjectId(id));

      if (allParticipants.length < 2) {
        throw Errors.badRequest('Conversation must have at least 2 participants');
      }

      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        participants: { $all: allParticipants, $size: allParticipants.length },
      })
        .populate('participants', 'name email avatar')
        .populate('lastMessage')
        .lean();

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const conversation = new Conversation({
        participants: allParticipants,
      });
      await conversation.save();

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email avatar')
        .lean();

      return populatedConversation;
    } catch (error) {
      logger.error(`Error creating conversation: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw Errors.badRequest(error.message);
      }
      throw error;
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) throw Errors.notFound('Conversation not found');

      // Check if user is a participant
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant)
        throw Errors.forbidden('You are not a participant in this conversation');

      // Delete all messages in the conversation
      await Message.deleteMany({ conversationId });

      await Conversation.findByIdAndDelete(conversationId);
    } catch (error) {
      logger.error(`Error deleting conversation: ${error}`);
      throw error;
    }
  }

  /**
   * Add participant to conversation
   */
  async addParticipant(
    conversationId: string,
    userId: string,
    newParticipantId: string
  ): Promise<any> {
    try {
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) throw Errors.notFound('Conversation not found');

      // Check if user is a participant
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant)
        throw Errors.forbidden('You are not a participant in this conversation');

      // Check if new participant already exists
      if (
        conversation.participants.some((p) => p.toString() === newParticipantId)
      ) {
        throw Errors.badRequest('User is already a participant in this conversation');
      }

      conversation.participants.push(new Types.ObjectId(newParticipantId));
      await conversation.save();

      const updatedConversation = await Conversation.findById(conversationId)
        .populate('participants', 'name email avatar')
        .populate('lastMessage')
        .lean();

      return updatedConversation;
    } catch (error) {
      logger.error(`Error adding participant to conversation: ${error}`);
      throw error;
    }
  }

  /**
   * Remove participant from conversation
   */
  async removeParticipant(
    conversationId: string,
    userId: string,
    participantId: string
  ): Promise<any> {
    try {
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) throw Errors.notFound('Conversation not found');

      // Check if user is a participant
      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant)
        throw Errors.forbidden('You are not a participant in this conversation');

      // Users can only remove themselves unless they're the creator (first participant)
      if (
        userId !== participantId &&
        conversation.participants[0].toString() !== userId
      ) {
        throw Errors.forbidden('You can only remove yourself from this conversation');
      }

      conversation.participants = conversation.participants.filter(
        (p) => p.toString() !== participantId
      );

      // Delete conversation if less than 2 participants remain
      if (conversation.participants.length < 2) {
        await Message.deleteMany({ conversationId });
        await Conversation.findByIdAndDelete(conversationId);
        return null;
      }

      await conversation.save();

      const updatedConversation = await Conversation.findById(conversationId)
        .populate('participants', 'name email avatar')
        .populate('lastMessage')
        .lean();

      return updatedConversation;
    } catch (error) {
      logger.error(`Error removing participant from conversation: ${error}`);
      throw error;
    }
  }

  /**
   * Find or create conversation with specific user
   */
  async findOrCreateDirectConversation(
    userId: string,
    otherUserId: string
  ): Promise<any> {
    try {
      if (userId === otherUserId) {
        throw Errors.badRequest('Cannot create conversation with yourself');
      }

      const participants = [
        new Types.ObjectId(userId),
        new Types.ObjectId(otherUserId),
      ];

      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        participants: { $all: participants, $size: 2 },
      })
        .populate('participants', 'name email avatar')
        .populate('lastMessage')
        .lean();

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const conversation = new Conversation({ participants });
      await conversation.save();

      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email avatar')
        .lean();

      return populatedConversation;
    } catch (error) {
      logger.error(`Error finding or creating direct conversation: ${error}`);
      throw error;
    }
  }
}

export default new ConversationService();
