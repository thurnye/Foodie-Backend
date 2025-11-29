import { Server, Socket } from 'socket.io';

export const registerTypingHandlers = (io: Server, socket: Socket): void => {
  // User started typing
  socket.on('typing:start', (data: {
    channelId?: string;
    conversationId?: string;
  }) => {
    const userId = (socket as any).userId;
    const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
    
    // Broadcast to room except sender
    socket.to(room).emit('typing:user-started', {
      userId,
      channelId: data.channelId,
      conversationId: data.conversationId,
    });
  });

  // User stopped typing
  socket.on('typing:stop', (data: {
    channelId?: string;
    conversationId?: string;
  }) => {
    const userId = (socket as any).userId;
    const room = data.channelId ? `channel:${data.channelId}` : `conversation:${data.conversationId}`;
    
    // Broadcast to room except sender
    socket.to(room).emit('typing:user-stopped', {
      userId,
      channelId: data.channelId,
      conversationId: data.conversationId,
    });
  });
};
