import { Types } from 'mongoose';
import { Errors, logger } from '@foodie/libs';
import { Message, Channel, Conversation } from '../models';

class MessageService {
  /**
   * Get messages for a channel
   */
  async getChannelMessages(
    channelId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    try {
      // Verify user has access to the channel
      const channel = await Channel.findById(channelId).populate('teamId');
      if (!channel) throw Errors.notFound('Channel not found');

      // Check if user is a member of the team
      const team = channel.teamId as any;
      const isTeamMember = team.members.some((m: any) => m.toString() === userId);
      if (!isTeamMember) throw Errors.forbidden('You are not a member of this team');

      // Check if channel is private and user is a member
      if (channel.isPrivate) {
        const isChannelMember = channel.members.some((m) => m.toString() === userId);
        if (!isChannelMember)
          throw Errors.forbidden('You do not have access to this private channel');
      }

      const messages = await Message.find({ channelId, isDeleted: false })
        .populate('sender', 'name email avatar')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Message.countDocuments({ channelId, isDeleted: false });

      return {
        messages: messages.reverse(), // Return in chronological order
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error getting channel messages: ${error}`);
      throw error;
    }
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    try {
      // Verify user is a participant
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) throw Errors.notFound('Conversation not found');

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === userId
      );
      if (!isParticipant)
        throw Errors.forbidden('You are not a participant in this conversation');

      const messages = await Message.find({ conversationId, isDeleted: false })
        .populate('sender', 'name email avatar')
        .populate('replyTo')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Message.countDocuments({ conversationId, isDeleted: false });

      return {
        messages: messages.reverse(), // Return in chronological order
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error getting conversation messages: ${error}`);
      throw error;
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string, userId: string): Promise<any> {
    try {
      const message = await Message.findById(messageId)
        .populate('sender', 'name email avatar')
        .populate('replyTo')
        .lean();

      if (!message) throw Errors.notFound('Message not found');
      if (message.isDeleted) throw Errors.notFound('Message has been deleted');

      // Verify user has access
      if (message.channelId) {
        const channel = await Channel.findById(message.channelId).populate('teamId');
        if (!channel) throw Errors.notFound('Channel not found');

        const team = channel.teamId as any;
        const isTeamMember = team.members.some((m: any) => m.toString() === userId);
        if (!isTeamMember) throw Errors.forbidden('Access denied');

        if (channel.isPrivate) {
          const isChannelMember = channel.members.some((m) => m.toString() === userId);
          if (!isChannelMember) throw Errors.forbidden('Access denied');
        }
      } else if (message.conversationId) {
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation) throw Errors.notFound('Conversation not found');

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) throw Errors.forbidden('Access denied');
      }

      return message;
    } catch (error) {
      logger.error(`Error fetching message: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new message
   */
  async createMessage(
    userId: string,
    data: {
      channelId?: string;
      conversationId?: string;
      content: string;
      type?: 'text' | 'file' | 'image' | 'video' | 'system';
      attachments?: any[];
      mentions?: string[];
      replyTo?: string;
    }
  ): Promise<any> {
    try {
      // Verify user has access
      if (data.channelId) {
        const channel = await Channel.findById(data.channelId).populate('teamId');
        if (!channel) throw Errors.notFound('Channel not found');

        const team = channel.teamId as any;
        const isTeamMember = team.members.some((m: any) => m.toString() === userId);
        if (!isTeamMember) throw Errors.forbidden('You are not a member of this team');

        if (channel.isPrivate) {
          const isChannelMember = channel.members.some((m) => m.toString() === userId);
          if (!isChannelMember)
            throw Errors.forbidden('You do not have access to this private channel');
        }

        // Update last message in channel
        const message = new Message({
          ...data,
          sender: userId,
          mentions: data.mentions?.map((id) => new Types.ObjectId(id)),
        });
        await message.save();

        channel.lastMessage = message._id;
        await channel.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar')
          .populate('replyTo')
          .lean();

        return populatedMessage;
      } else if (data.conversationId) {
        const conversation = await Conversation.findById(data.conversationId);
        if (!conversation) throw Errors.notFound('Conversation not found');

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant)
          throw Errors.forbidden('You are not a participant in this conversation');

        // Update last message in conversation
        const message = new Message({
          ...data,
          sender: userId,
          mentions: data.mentions?.map((id) => new Types.ObjectId(id)),
        });
        await message.save();

        conversation.lastMessage = message._id;
        await conversation.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar')
          .populate('replyTo')
          .lean();

        return populatedMessage;
      } else {
        throw Errors.badRequest(
          'Message must belong to either a channel or a conversation'
        );
      }
    } catch (error) {
      logger.error(`Error creating message: ${error}`);
      if (error instanceof Error && error.name === 'ValidationError') {
        throw Errors.badRequest(error.message);
      }
      throw error;
    }
  }

  /**
   * Update a message (edit)
   */
  async updateMessage(
    messageId: string,
    userId: string,
    data: { content: string }
  ): Promise<any> {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw Errors.notFound('Message not found');
      if (message.isDeleted) throw Errors.notFound('Message has been deleted');

      if (message.sender.toString() !== userId)
        throw Errors.forbidden('You can only edit your own messages');

      message.content = data.content;
      message.isEdited = true;
      await message.save();

      const updatedMessage = await Message.findById(messageId)
        .populate('sender', 'name email avatar')
        .populate('replyTo')
        .lean();

      return updatedMessage;
    } catch (error) {
      logger.error(`Error updating message: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw Errors.notFound('Message not found');
      if (message.isDeleted) throw Errors.notFound('Message has already been deleted');

      if (message.sender.toString() !== userId)
        throw Errors.forbidden('You can only delete your own messages');

      message.isDeleted = true;
      message.content = '[Message deleted]';
      await message.save();
    } catch (error) {
      logger.error(`Error deleting message: ${error}`);
      throw error;
    }
  }

  /**
   * Add reaction to a message
   */
  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<any> {
    try {
      const message = await Message.findById(messageId);
      if (!message) throw Errors.notFound('Message not found');
      if (message.isDeleted) throw Errors.notFound('Message has been deleted');

      // Find existing reaction with same emoji
      const existingReaction = message.reactions?.find((r) => r.emoji === emoji);

      if (existingReaction) {
        // Check if user already reacted
        const userAlreadyReacted = existingReaction.users.some(
          (u) => u.toString() === userId
        );

        if (userAlreadyReacted) {
          // Remove user's reaction
          existingReaction.users = existingReaction.users.filter(
            (u) => u.toString() !== userId
          );
          existingReaction.count = existingReaction.users.length;

          // Remove reaction if no users left
          if (existingReaction.count === 0) {
            message.reactions = message.reactions?.filter((r) => r.emoji !== emoji);
          }
        } else {
          // Add user's reaction
          existingReaction.users.push(new Types.ObjectId(userId));
          existingReaction.count = existingReaction.users.length;
        }
      } else {
        // Create new reaction
        if (!message.reactions) message.reactions = [];
        message.reactions.push({
          emoji,
          users: [new Types.ObjectId(userId)],
          count: 1,
        });
      }

      await message.save();

      const updatedMessage = await Message.findById(messageId)
        .populate('sender', 'name email avatar')
        .populate('replyTo')
        .lean();

      return updatedMessage;
    } catch (error) {
      logger.error(`Error adding reaction to message: ${error}`);
      throw error;
    }
  }
}

export default new MessageService();
