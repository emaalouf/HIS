import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../../config';
import { JWTPayload } from '../../types';

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): void {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    next(new Error('Authentication required'));
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    socket.data.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new Error('Token expired'));
      return;
    }
    next(new Error('Invalid token'));
  }
}
