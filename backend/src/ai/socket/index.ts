import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { socketAuthMiddleware } from './auth';
import { handleConnection } from './handler';
import config from '../../config';
import { setDefaultOpenAIKey } from '@openai/agents';
import { ClientToServerEvents, ServerToClientEvents } from './events';

export function setupSocketIO(httpServer: HTTPServer): SocketIOServer<ClientToServerEvents, ServerToClientEvents> {
  if (!process.env.OPENAI_KEY) throw new Error("No openai key set")
  setDefaultOpenAIKey(process.env.OPENAI_KEY)
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    path: '/ws',
  });

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => handleConnection(io, socket));
  console.log('AI Socket.IO server initialized on path /ws');

  return io;
}
