import { Sparkles, X, Minus, Trash2 } from 'lucide-react';
import { useAIChat } from '../../stores/ai-chat';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { cn } from '../../lib/utils';

export function AIChatWidget() {
    const { messages, connectionStatus, sendMessage, clearMessages, isOpen, setIsOpen } = useAIChat();

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Chat Panel */}
            {isOpen && (
                <div className="w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">AI Assistant</p>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={cn(
                                            'w-1.5 h-1.5 rounded-full',
                                            connectionStatus === 'connected' && 'bg-green-500',
                                            connectionStatus === 'connecting' && 'bg-yellow-500 animate-pulse',
                                            connectionStatus === 'disconnected' && 'bg-gray-400'
                                        )}
                                    />
                                    <span className="text-xs text-gray-500 capitalize">{connectionStatus}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    onClick={clearMessages}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    title="Clear chat"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                title="Minimize"
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                title="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <ChatMessages messages={messages} />

                    {/* Input */}
                    <ChatInput
                        onSend={sendMessage}
                        disabled={connectionStatus !== 'connected'}
                    />
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isOpen
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                )}
                title="AI Assistant"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Sparkles className="w-6 h-6 text-white" />
                )}
            </button>
        </div>
    );
}
