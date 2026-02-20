export const AI_SOCKET_EVENTS = {
  SEND_MESSAGE: 'send_message',
  DEACTIVATE_SESSION: 'deactivate_session',
  SESSION_HISTORY: 'session_history',
  MESSAGE_DELTA: 'message_delta',
  MESSAGE_COMPLETE: 'message_complete',
  MESSAGE_ERROR: 'message_error',
  TOOL_CALL: 'tool_call',
} as const;

export interface SocketMessagePayload {
  message: string;
}

export interface MessageDeltaEvent {
  id: string;
  delta: string;
}

export interface MessageCompleteEvent {
  id: string;
  content: string;
}

export interface MessageErrorEvent {
  id: string;
  error: string;
}

export interface SessionHistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionHistoryEvent {
  messages: SessionHistoryMessage[];
}

export type ToolAction =
  | 'LOOKUP_PATIENT'
  | 'LOOKUP_APPOINTMENT'
  | 'LOOKUP_DEPARTMENT'
  | 'LOOKUP_CLINICAL'
  | 'LOOKUP_BILLING'
  | 'PROCESSING';

export interface ToolCallEvent {
  id: string;
  action: ToolAction;
}

export interface ClientToServerEvents {
  [AI_SOCKET_EVENTS.SEND_MESSAGE]: (payload: SocketMessagePayload) => void;
  [AI_SOCKET_EVENTS.DEACTIVATE_SESSION]: () => void;
}

export interface ServerToClientEvents {
  [AI_SOCKET_EVENTS.SESSION_HISTORY]: (payload: SessionHistoryEvent) => void;
  [AI_SOCKET_EVENTS.MESSAGE_DELTA]: (payload: MessageDeltaEvent) => void;
  [AI_SOCKET_EVENTS.MESSAGE_COMPLETE]: (payload: MessageCompleteEvent) => void;
  [AI_SOCKET_EVENTS.MESSAGE_ERROR]: (payload: MessageErrorEvent) => void;
  [AI_SOCKET_EVENTS.TOOL_CALL]: (payload: ToolCallEvent) => void;
}
