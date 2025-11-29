import { Server, Socket } from 'socket.io';
import { MessageService } from '../../services/message.service';
import { logger } from '@foodie/libs';

export const registerMessageHandlers = (io: Server, socket: Socket): void => {
  // Send a message
  socket.on('message:send', async (data: {
    channelId?: string;
    conversationId?: string;
    content: string;
    type?: 'text' | 'file' | 'image' | 'video';
    attachments?: any[];
    mentions?: string[];
    replyTo?: string;
  }) => {
    try {
      const userId = (socket as any).userId;
      
      const message = await MessageService.sendMessage({
        channelId: data.channelId,
        conversationId: data.conversationId,
        sender: userId,
        content: data.content,
        type: data.type || 'text',
        attachments: data.attachments,
        mentions: data.mentions,
        replyTo: data.replyTo,
      });

      // Emit to channel or conversation room
      const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
      io.to(room).emit('message:new', message);

      // Emit to mentioned users
      if (data.mentions && data.mentions.length > 0) {
        data.mentions.forEach((userId) => {
          io.to(`user:${userId}`).emit('notification:mention', {
            messageId: message._id,
            channelId: data.channelId,
            conversationId: data.conversationId,
            sender: userId,
          });
        });
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  });

  // Edit a message
  socket.on('message:edit', async (data: {
    messageId: string;
    content: string;
  }) => {
    try {
      const message = await MessageService.editMessage(data.messageId, data.content);
      
      // Emit to channel or conversation room
      const room = message.channelId 
        ? `channel:${message.channelId}` 
        : `conversation:${message.conversationId}`;
      io.to(room).emit('message:updated', message);
    } catch (error) {
      logger.error('Error editing message:', error);
      socket.emit('message:error', { error: 'Failed to edit message' });
    }
  });

  // Delete a message
  socket.on('message:delete', async (data: { messageId: string }) => {
    try {
      const message = await MessageService.deleteMessage(data.messageId);
      
      // Emit to channel or conversation room
      const room = message.channelId 
        ? `channel:${message.channelId}` 
        : `conversation:${message.conversationId}`;
      io.to(room).emit('message:deleted', { messageId: data.messageId });
    } catch (error) {
      logger.error('Error deleting message:', error);
      socket.emit('message:error', { error: 'Failed to delete message' });
    }
  });

  // Add reaction to a message
  socket.on('message:reaction:add', async (data: {
    messageId: string;
    emoji: string;
  }) => {
    try {
      const userId = (socket as any).userId;
      const message = await MessageService.addReaction(data.messageId, userId, data.emoji);
      
      // Emit to channel or conversation room
      const room = message.channelId 
        ? `channel:${message.channelId}` 
        : `conversation:${message.conversationId}`;
      io.to(room).emit('message:reaction:added', {
        messageId: data.messageId,
        reaction: { userId, emoji: data.emoji },
      });
    } catch (error) {
      logger.error('Error adding reaction:', error);
      socket.emit('message:error', { error: 'Failed to add reaction' });
    }
  });

  // Remove reaction from a message
  socket.on('message:reaction:remove', async (data: {
    messageId: string;
    emoji: string;
  }) => {
    try {
      const userId = (socket as any).userId;
      const message = await MessageService.removeReaction(data.messageId, userId, data.emoji);
      
      // Emit to channel or conversation room
      const room = message.channelId 
        ? `channel:${message.channelId}` 
        : `conversation:${message.conversationId}`;
      io.to(room).emit('message:reaction:removed', {
        messageId: data.messageId,
        userId,
        emoji: data.emoji,
      });
    } catch (error) {
      logger.error('Error removing reaction:', error);
      socket.emit('message:error', { error: 'Failed to remove reaction' });
    }
  });
};
