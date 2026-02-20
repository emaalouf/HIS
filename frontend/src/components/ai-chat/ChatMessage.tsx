import { cn } from '../../lib/utils';
import type { ChatMessage as ChatMessageType } from '../../stores/ai-chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
    message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    if (message.isThinking) {
        return (
            <div className="flex items-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm bg-gray-100 rounded-bl-md">
                    <div className="flex items-center gap-2">
                        <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                        </span>
                        {message.toolCall && (
                            <span className="text-xs text-gray-400 italic">{message.toolCall}...</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}>
            {message.toolCall && (
                <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-500">{message.toolCall}...</span>
                </div>
            )}
            <div
                className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    isUser
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-bl-md'
                )}
            >
                {isUser ? (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                ) : (
                    <div className="break-words">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                a: ({ ...props }) => (
                                    <a {...props} target="_blank" rel="noreferrer" className="text-blue-600 underline" />
                                ),
                                p: ({ ...props }) => <p {...props} className="my-1 whitespace-pre-wrap" />,
                                ul: ({ ...props }) => <ul {...props} className="my-1 ml-5 list-disc" />,
                                ol: ({ ...props }) => <ol {...props} className="my-1 ml-5 list-decimal" />,
                                li: ({ ...props }) => <li {...props} className="my-0.5" />,
                                blockquote: ({ ...props }) => (
                                    <blockquote {...props} className="my-2 border-l-2 border-gray-300 pl-3 text-gray-700" />
                                ),
                                code: ({ inline, className, children, ...props }) => {
                                    const isBlock = !inline;
                                    if (isBlock) {
                                        return (
                                            <code
                                                {...props}
                                                className={cn(
                                                    className,
                                                    'block my-2 overflow-x-auto rounded-md bg-gray-800 px-3 py-2 text-xs text-gray-100'
                                                )}
                                            >
                                                {children}
                                            </code>
                                        );
                                    }

                                    return (
                                        <code
                                            {...props}
                                            className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs text-gray-800"
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                )}
                {message.isStreaming && !message.toolCall && (
                    <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded-sm align-text-bottom" />
                )}
            </div>
        </div>
    );
}
