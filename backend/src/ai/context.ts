import { JWTPayload } from '../types';
import { ChatSession } from './types';
import prisma from '../config/database';
import type { AgentInputItem } from '@openai/agents';
import type { Prisma } from '@prisma/client';

const sessions = new Map<string, ChatSession>();

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function toAgentInputItem(payload: Prisma.JsonValue): AgentInputItem | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  return payload as unknown as AgentInputItem;
}

export async function getOrCreateSession(socketId: string, user: JWTPayload): Promise<ChatSession> {
  let session = sessions.get(socketId);
  if (!session) {
    const existing = await prisma.aiChatSession.findFirst({
      where: {
        userId: user.userId,
        isActive: true,
      },
      include: {
        messages: {
          orderBy: { sequence: 'asc' },
        },
      },
      orderBy: { lastActivityAt: 'desc' },
    });

    const dbSession = existing ?? await prisma.aiChatSession.create({
      data: {
        userId: user.userId,
      },
      include: {
        messages: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    session = {
      id: dbSession.id,
      user,
      history: dbSession.messages
        .map((msg) => toAgentInputItem(msg.payload))
        .filter((item): item is AgentInputItem => item !== null),
      createdAt: dbSession.createdAt,
      lastActivity: new Date(),
    };
    sessions.set(socketId, session);
  }
  session.lastActivity = new Date();
  void prisma.aiChatSession.update({
    where: { id: session.id },
    data: { lastActivityAt: session.lastActivity },
  });
  return session;
}

export async function persistSessionHistory(session: ChatSession): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.aiChatMessage.deleteMany({
      where: { sessionId: session.id },
    });

    if (session.history.length > 0) {
      await tx.aiChatMessage.createMany({
        data: session.history.map((item, index) => ({
          sessionId: session.id,
          sequence: index,
          payload: item as unknown as Prisma.InputJsonValue,
        })),
      });
    }

    await tx.aiChatSession.update({
      where: { id: session.id },
      data: {
        lastActivityAt: session.lastActivity,
      },
    });
  });
}

export async function deactivateSession(socketId: string, user: JWTPayload): Promise<void> {
  const inMemorySession = sessions.get(socketId);
  if (inMemorySession) {
    await prisma.aiChatSession.update({
      where: { id: inMemorySession.id },
      data: {
        isActive: false,
        lastActivityAt: new Date(),
      },
    });
    sessions.delete(socketId);
    return;
  }

  const activeSession = await prisma.aiChatSession.findFirst({
    where: {
      userId: user.userId,
      isActive: true,
    },
    orderBy: { lastActivityAt: 'desc' },
    select: { id: true },
  });

  if (!activeSession) {
    return;
  }

  await prisma.aiChatSession.update({
    where: { id: activeSession.id },
    data: {
      isActive: false,
      lastActivityAt: new Date(),
    },
  });
}

export function removeSession(socketId: string): void {
  sessions.delete(socketId);
}

export function cleanupStaleSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivity.getTime() > SESSION_TIMEOUT_MS) {
      sessions.delete(id);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupStaleSessions, 10 * 60 * 1000);
