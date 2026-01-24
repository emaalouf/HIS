import { useState } from 'react';
import { Input } from './Input';

export type SelectOption = {
    id: string;
    label: string;
    subLabel?: string;
};

interface SearchableSelectProps {
    label: string;
    placeholder?: string;
    value: string;
    required?: boolean;
    options: SelectOption[];
    selectedId?: string;
    isLoading?: boolean;
    onInputChange: (value: string) => void;
    onSelect: (option: SelectOption) => void;
}

export function SearchableSelect({
    label,
    placeholder,
    value,
    required,
    options,
    selectedId,
    isLoading,
    onInputChange,
    onSelect,
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleBlur = () => {
        setTimeout(() => setIsOpen(false), 150);
    };

    return (
        <div className="relative">
            <Input
                label={label}
                value={value}
                onChange={(e) => onInputChange(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onBlur={handleBlur}
                placeholder={placeholder}
                required={required}
            />
            {isOpen && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto">
                    {isLoading ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                    ) : options.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
                    ) : (
                        options.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    onSelect(option);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${selectedId === option.id ? 'bg-blue-50' : ''}`}
                            >
                                <div className="font-medium text-gray-900">{option.label}</div>
                                {option.subLabel && (
                                    <div className="text-xs text-gray-500">{option.subLabel}</div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
