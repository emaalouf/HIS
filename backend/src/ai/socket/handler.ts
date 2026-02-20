import { Server, Socket } from 'socket.io';
import { run, user as userMessageItem } from '@openai/agents';
import { createHISAgent } from '../agent';
import {
  deactivateSession,
  getOrCreateSession,
  persistSessionHistory,
  removeSession,
} from '../context';
import {
  extractTextDeltaFromRawEvent,
  generateMessageId,
  getToolAction,
  toSessionHistoryMessages,
} from '../utils';
import { JWTPayload } from '../../types';
import {
  AI_SOCKET_EVENTS,
  ClientToServerEvents,
  ServerToClientEvents,
  SocketMessagePayload,
  MessageDeltaEvent,
  MessageCompleteEvent,
  MessageErrorEvent,
  ToolCallEvent,
} from './events';

export function handleConnection(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
): void {
  const user = socket.data.user as JWTPayload;
  const agent = createHISAgent();

  console.log(`[AI Socket] User ${user.email} connected (${socket.id})`);

  void (async () => {
    try {
      const session = await getOrCreateSession(socket.id, user);
      socket.emit(AI_SOCKET_EVENTS.SESSION_HISTORY, {
        messages: toSessionHistoryMessages(session.history),
      });
    } catch (error) {
      console.error('[AI Socket] Failed to load session history:', error);
    }
  })();

  socket.on(AI_SOCKET_EVENTS.SEND_MESSAGE, async (data: SocketMessagePayload) => {
    const messageId = generateMessageId();

    if (!data?.message || typeof data.message !== 'string') {
      const errorEvent: MessageErrorEvent = {
        id: messageId,
        error: 'Invalid message format',
      };
      socket.emit(AI_SOCKET_EVENTS.MESSAGE_ERROR, errorEvent);
      return;
    }

    const userMessage = data.message.trim();
    if (userMessage.length === 0 || userMessage.length > 4000) {
      const errorEvent: MessageErrorEvent = {
        id: messageId,
        error: userMessage.length === 0
          ? 'Message cannot be empty'
          : 'Message too long (max 4000 characters)',
      };
      socket.emit(AI_SOCKET_EVENTS.MESSAGE_ERROR, errorEvent);
      return;
    }

    try {
      const session = await getOrCreateSession(socket.id, user);
      session.lastActivity = new Date();
      const input = [...session.history, userMessageItem(userMessage)];

      // Run agent with streaming
      const result = await run(agent, input, { stream: true });

      let fullOutput = '';

      for await (const event of result) {
        if (event.type === 'raw_model_stream_event') {
          const rawEvent = event.data as Record<string, unknown>;
          const delta = extractTextDeltaFromRawEvent(rawEvent);
          if (delta) {
            fullOutput += delta;
            const deltaEvent: MessageDeltaEvent = {
              id: messageId,
              delta,
            };
            socket.emit(AI_SOCKET_EVENTS.MESSAGE_DELTA, deltaEvent);
          }
        } else if (event.type === 'run_item_stream_event' && event.name === 'tool_called') {
          const rawItem = (event.item.rawItem ?? {}) as Record<string, unknown>;
          const rawType = typeof rawItem.type === 'string' ? rawItem.type : undefined;
          const toolName =
            rawType === 'function_call' && typeof rawItem.name === 'string'
              ? rawItem.name
              : 'unknown';

          const toolEvent: ToolCallEvent = {
            id: messageId,
            action: getToolAction(toolName),
          };
          socket.emit(AI_SOCKET_EVENTS.TOOL_CALL, toolEvent);
        }
      }

      // Wait for completion
      await result.completed;

      // Use the final output from the result
      const rawFinalOutput = result.finalOutput || fullOutput || 'No response generated.';
      const finalOutput =
        typeof rawFinalOutput === 'string'
          ? rawFinalOutput
          : JSON.stringify(rawFinalOutput);

      // Persist native run history so the next turn can pass it back directly.
      session.history = result.history.slice(-100);
      session.lastActivity = new Date();
      await persistSessionHistory(session);

      const completeEvent: MessageCompleteEvent = {
        id: messageId,
        content: finalOutput,
      };
      socket.emit(AI_SOCKET_EVENTS.MESSAGE_COMPLETE, completeEvent);
    } catch (error) {
      console.error('[AI Socket] Agent run error:', error);
      const errorEvent: MessageErrorEvent = {
        id: messageId,
        error: 'Failed to process your request. Please try again.',
      };
      socket.emit(AI_SOCKET_EVENTS.MESSAGE_ERROR, errorEvent);
    }
  });

  socket.on(AI_SOCKET_EVENTS.DEACTIVATE_SESSION, async () => {
    try {
      await deactivateSession(socket.id, user);
      socket.emit(AI_SOCKET_EVENTS.SESSION_HISTORY, { messages: [] });
    } catch (error) {
      console.error('[AI Socket] Failed to deactivate session:', error);
      const errorEvent: MessageErrorEvent = {
        id: generateMessageId(),
        error: 'Failed to clear chat session. Please try again.',
      };
      socket.emit(AI_SOCKET_EVENTS.MESSAGE_ERROR, errorEvent);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`[AI Socket] User ${user.email} disconnected (${reason})`);
    // Remove session after a delay to allow reconnection
    setTimeout(() => {
      if (!io.sockets.sockets.has(socket.id)) {
        removeSession(socket.id);
      }
    }, 60000);
  });
}
