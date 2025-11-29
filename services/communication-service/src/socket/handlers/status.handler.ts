import { Server, Socket } from 'socket.io';

export const registerStatusHandlers = (io: Server, socket: Socket): void => {
  // User status change
  socket.on('status:change', (data: {
    status: 'online' | 'away' | 'busy' | 'offline';
  }) => {
    const userId = (socket as any).userId;
    
    // Broadcast to all connected users
    io.emit('status:user-changed', {
      userId,
      status: data.status,
    });
  });

  // User joins a channel
  socket.on('channel:join', (data: { channelId: string }) => {
    socket.join(`channel:${data.channelId}`);
  });

  // User leaves a channel
  socket.on('channel:leave', (data: { channelId: string }) => {
    socket.leave(`channel:${data.channelId}`);
  });

  // User joins a conversation
  socket.on('conversation:join', (data: { conversationId: string }) => {
    socket.join(`conversation:${data.conversationId}`);
  });

  // User leaves a conversation
  socket.on('conversation:leave', (data: { conversationId: string }) => {
    socket.leave(`conversation:${data.conversationId}`);
  });
};
