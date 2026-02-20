import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { aiChatService, type ConnectionStatus } from '../services/ai-chat.service';

export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    isStreaming: boolean;
    isThinking?: boolean;
    toolCall?: string;
}

interface AIChatContextType {
    messages: ChatMessage[];
    connectionStatus: ConnectionStatus;
    isStreaming: boolean;
    sendMessage: (text: string) => void;
    clearMessages: () => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

function generateId(): string {
    return `msg_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
}

export function AIChatProvider({ children }: { children: ReactNode }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const [isOpen, setIsOpen] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const knownAssistantIds = useRef<Set<string>>(new Set());

    // Lazy connection: only connect when chat is opened
    useEffect(() => {
        if (!isOpen) return;

        aiChatService.connect({
            onSessionHistory: (data) => {
                knownAssistantIds.current.clear();
                const hydrated = data.messages.map((msg) => {
                    if (msg.role === 'assistant') {
                        knownAssistantIds.current.add(msg.id);
                    }

                    return {
                        id: msg.id,
                        content: msg.content,
                        role: msg.role,
                        timestamp: new Date(),
                        isStreaming: false,
                    };
                });

                setMessages(hydrated);
                setIsStreaming(false);
            },
            onDelta: (data) => {
                setIsStreaming(true);
                if (!knownAssistantIds.current.has(data.id)) {
                    // First delta - replace thinking indicator with streaming message
                    knownAssistantIds.current.add(data.id);
                    setMessages((prev) => {
                        const filtered = prev.filter((msg) => !msg.isThinking);
                        return [
                            ...filtered,
                            {
                                id: data.id,
                                content: data.delta,
                                role: 'assistant',
                                timestamp: new Date(),
                                isStreaming: true,
                            },
                        ];
                    });
                } else {
                    // Append delta to existing message
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === data.id
                                ? { ...msg, content: msg.content + data.delta }
                                : msg
                        )
                    );
                }
            },
            onComplete: (data) => {
                setMessages((prev) => {
                    const filtered = prev.filter((msg) => !msg.isThinking);
                    const existingIndex = filtered.findIndex((msg) => msg.id === data.id);

                    if (existingIndex === -1) {
                        // Some runs may not emit deltas; ensure complete message still appears.
                        knownAssistantIds.current.add(data.id);
                        return [
                            ...filtered,
                            {
                                id: data.id,
                                content: data.content,
                                role: 'assistant',
                                timestamp: new Date(),
                                isStreaming: false,
                            },
                        ];
                    }

                    return filtered.map((msg) =>
                        msg.id === data.id
                            ? { ...msg, content: data.content, isStreaming: false, toolCall: undefined }
                            : msg
                    );
                });
                setIsStreaming(false);
            },
            onError: (data) => {
                setIsStreaming(false);
                if (knownAssistantIds.current.has(data.id)) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === data.id
                                ? { ...msg, content: data.error, isStreaming: false, toolCall: undefined }
                                : msg
                        )
                    );
                } else {
                    setMessages((prev) => {
                        const filtered = prev.filter((msg) => !msg.isThinking);
                        return [
                            ...filtered,
                            {
                                id: data.id || generateId(),
                                content: data.error,
                                role: 'assistant',
                                timestamp: new Date(),
                                isStreaming: false,
                            },
                        ];
                    });
                }
            },
            onToolCall: (data) => {
                setIsStreaming(true);
                const toolLabel = formatToolAction(data.action);
                if (!knownAssistantIds.current.has(data.id)) {
                    // Tool call before any delta - create message with tool indicator
                    knownAssistantIds.current.add(data.id);
                    setMessages((prev) => {
                        const filtered = prev.filter((msg) => !msg.isThinking);
                        return [
                            ...filtered,
                            {
                                id: data.id,
                                content: '',
                                role: 'assistant',
                                timestamp: new Date(),
                                isStreaming: true,
                                toolCall: toolLabel,
                            },
                        ];
                    });
                } else {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === data.id
                                ? { ...msg, toolCall: toolLabel }
                                : msg
                        )
                    );
                }
            },
            onStatusChange: setConnectionStatus,
        });

        return () => {
            aiChatService.disconnect();
            setConnectionStatus('disconnected');
        };
    }, [isOpen]);

    // Disconnect on unmount (e.g. logout navigates away from MainLayout)
    useEffect(() => {
        return () => {
            aiChatService.disconnect();
        };
    }, []);

    const sendMessage = useCallback((text: string) => {
        const trimmed = text.trim();
        if (!trimmed || isStreaming) return;

        setIsStreaming(true);

        setMessages((prev) => [
            ...prev,
            {
                id: generateId(),
                content: trimmed,
                role: 'user',
                timestamp: new Date(),
                isStreaming: false,
            },
            // Thinking indicator
            {
                id: generateId(),
                content: '',
                role: 'assistant',
                timestamp: new Date(),
                isStreaming: false,
                isThinking: true,
            },
        ]);

        aiChatService.sendMessage(trimmed);
    }, [isStreaming]);

    const clearMessages = useCallback(() => {
        aiChatService.deactivateSession();
        setMessages([]);
        knownAssistantIds.current.clear();
        setIsStreaming(false);
    }, []);

    return (
        <AIChatContext.Provider
            value={{
                messages,
                connectionStatus,
                isStreaming,
                sendMessage,
                clearMessages,
                isOpen,
                setIsOpen,
            }}
        >
            {children}
        </AIChatContext.Provider>
    );
}

export function useAIChat() {
    const context = useContext(AIChatContext);
    if (context === undefined) {
        throw new Error('useAIChat must be used within an AIChatProvider');
    }
    return context;
}

const TOOL_LABELS: Record<string, string> = {
    LOOKUP_PATIENT: 'Checking patient records',
    LOOKUP_APPOINTMENT: 'Checking appointments',
    LOOKUP_DEPARTMENT: 'Checking departments and staffing',
    LOOKUP_CLINICAL: 'Checking clinical records',
    LOOKUP_BILLING: 'Checking billing records',
    PROCESSING: 'Processing request',
};

function formatToolAction(action: string): string {
    return TOOL_LABELS[action] || TOOL_LABELS.PROCESSING;
}
