import { io, type Socket } from 'socket.io-client';
import {
    AI_SOCKET_EVENTS,
    type ClientToServerEvents,
    type ServerToClientEvents,
    type SessionHistoryEvent,
    type MessageCompleteEvent,
    type MessageDeltaEvent,
    type MessageErrorEvent,
    type ToolCallEvent,
} from './ai-chat.events';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface ChatServiceEvents {
    onSessionHistory: (data: SessionHistoryEvent) => void;
    onDelta: (data: MessageDeltaEvent) => void;
    onComplete: (data: MessageCompleteEvent) => void;
    onError: (data: MessageErrorEvent) => void;
    onToolCall: (data: ToolCallEvent) => void;
    onStatusChange: (status: ConnectionStatus) => void;
}

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getSocketBaseUrl(apiUrl: string): string | undefined {
    // Default local dev path: use current origin + Vite proxy for /ws
    if (!apiUrl || apiUrl === '/api') {
        return undefined;
    }

    try {
        const resolved = new URL(apiUrl, window.location.origin);

        // If API URL includes /api, strip it for socket host base.
        if (resolved.pathname.endsWith('/api')) {
            resolved.pathname = resolved.pathname.slice(0, -4) || '/';
        }

        return `${resolved.origin}${resolved.pathname === '/' ? '' : resolved.pathname}`;
    } catch {
        return undefined;
    }
}

class AIChatService {
    private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
    private events: ChatServiceEvents | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 3;

    connect(events: ChatServiceEvents) {
        if (this.socket?.connected) return;

        // Clean up any existing disconnected socket before creating a new one
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }

        this.events = events;
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        events.onStatusChange('connecting');
        this.reconnectAttempts = 0;

        this.socket = io(getSocketBaseUrl(API_URL), {
            auth: { token },
            path: '/ws',
            transports: ['websocket', 'polling'],
        }) as Socket<ServerToClientEvents, ClientToServerEvents>;

        this.socket.on('connect', () => {
            this.reconnectAttempts = 0;
            this.events?.onStatusChange('connected');
        });

        this.socket.on('disconnect', () => {
            this.events?.onStatusChange('disconnected');
        });

        const listeners: {
            [AI_SOCKET_EVENTS.SESSION_HISTORY]: (data: SessionHistoryEvent) => void;
            [AI_SOCKET_EVENTS.MESSAGE_DELTA]: (data: MessageDeltaEvent) => void;
            [AI_SOCKET_EVENTS.MESSAGE_COMPLETE]: (data: MessageCompleteEvent) => void;
            [AI_SOCKET_EVENTS.MESSAGE_ERROR]: (data: MessageErrorEvent) => void;
            [AI_SOCKET_EVENTS.TOOL_CALL]: (data: ToolCallEvent) => void;
        } = {
            [AI_SOCKET_EVENTS.SESSION_HISTORY]: (data) => this.events?.onSessionHistory(data),
            [AI_SOCKET_EVENTS.MESSAGE_DELTA]: (data) => this.events?.onDelta(data),
            [AI_SOCKET_EVENTS.MESSAGE_COMPLETE]: (data) => this.events?.onComplete(data),
            [AI_SOCKET_EVENTS.MESSAGE_ERROR]: (data) => this.events?.onError(data),
            [AI_SOCKET_EVENTS.TOOL_CALL]: (data) => this.events?.onToolCall(data),
        };

        this.socket.on(AI_SOCKET_EVENTS.SESSION_HISTORY, listeners[AI_SOCKET_EVENTS.SESSION_HISTORY]);
        this.socket.on(AI_SOCKET_EVENTS.MESSAGE_DELTA, listeners[AI_SOCKET_EVENTS.MESSAGE_DELTA]);
        this.socket.on(AI_SOCKET_EVENTS.MESSAGE_COMPLETE, listeners[AI_SOCKET_EVENTS.MESSAGE_COMPLETE]);
        this.socket.on(AI_SOCKET_EVENTS.MESSAGE_ERROR, listeners[AI_SOCKET_EVENTS.MESSAGE_ERROR]);
        this.socket.on(AI_SOCKET_EVENTS.TOOL_CALL, listeners[AI_SOCKET_EVENTS.TOOL_CALL]);

        this.socket.on('connect_error', (err) => {
            // Check if this is an auth error and retry with a fresh token
            const isAuthError = err.message?.toLowerCase().includes('auth') ||
                err.message?.toLowerCase().includes('unauthorized') ||
                err.message?.toLowerCase().includes('jwt') ||
                err.message?.toLowerCase().includes('token');

            if (isAuthError && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                const freshToken = localStorage.getItem('accessToken');
                if (freshToken && this.socket) {
                    this.socket.auth = { token: freshToken };
                    // socket.io-client will auto-retry with updated auth
                    return;
                }
            }

            this.events?.onStatusChange('disconnected');
        });
    }

    sendMessage(text: string) {
        if (!this.socket?.connected) return;
        this.socket.emit(AI_SOCKET_EVENTS.SEND_MESSAGE, { message: text });
    }

    deactivateSession() {
        if (!this.socket?.connected) return;
        this.socket.emit(AI_SOCKET_EVENTS.DEACTIVATE_SESSION);
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
        this.events = null;
        this.reconnectAttempts = 0;
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

export const aiChatService = new AIChatService();
