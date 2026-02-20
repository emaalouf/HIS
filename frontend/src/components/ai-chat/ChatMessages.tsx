import { useCallback, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage.tsx';
import type { ChatMessage as ChatMessageType } from '../../stores/ai-chat';

interface ChatMessagesProps {
    messages: ChatMessageType[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const isNearBottom = useRef(true);

    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        const threshold = 80;
        isNearBottom.current =
            container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    }, []);

    useEffect(() => {
        if (isNearBottom.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">AI Assistant</p>
                    <p className="text-xs text-gray-500 mt-1">Ask me anything about the HIS system.</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-3"
        >
            {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
}
