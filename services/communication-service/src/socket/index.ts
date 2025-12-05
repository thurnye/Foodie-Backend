import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '@foodie/libs';
import { registerMessageHandlers } from './handlers/message.handler';
import { registerTypingHandlers } from './handlers/typing.handler';
import { registerStatusHandlers } from './handlers/status.handler';

export const initializeWebSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN!,
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId || socket.handshake.headers['x-user-id'];
    
    if (!userId) {
      return next(new Error('Authentication error'));
    }

    // Attach userId to socket
    (socket as any).userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    logger.info(`User connected: ${userId}`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Register event handlers
    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerStatusHandlers(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
      
      // Broadcast user offline status
      io.emit('status:user-changed', {
        userId,
        status: 'offline',
      });
    });
  });

  logger.info('WebSocket server initialized');
  return io;
};
