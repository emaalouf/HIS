import { JWTPayload } from '../types';
import type { AgentInputItem } from '@openai/agents';

export interface AgentContext {
  userId: string;
  userRole: string;
  sessionId: string;
}

export interface ChatSession {
  id: string;
  user: JWTPayload;
  history: AgentInputItem[];
  createdAt: Date;
  lastActivity: Date;
}

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
