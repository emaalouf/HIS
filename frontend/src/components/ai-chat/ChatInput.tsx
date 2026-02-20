import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatInputProps {
    onSend: (text: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [text, setText] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!text.trim() || disabled) return;
        onSend(text);
        setText('');
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3">
            <div className="flex items-end gap-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={disabled}
                    rows={1}
                    className={cn(
                        'flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
                        'placeholder:text-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        'max-h-24'
                    )}
                />
                <button
                    type="submit"
                    disabled={!text.trim() || disabled}
                    className={cn(
                        'flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center transition-colors',
                        'bg-blue-600 text-white hover:bg-blue-700',
                        'disabled:opacity-50 disabled:pointer-events-none',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    )}
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}
