import React, { useState, useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
  disabled?: boolean;
  suggestions?: string[];
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
  value = [],
  onChange,
  placeholder = 'Add a tag...',
  className,
  maxTags,
  disabled = false,
  suggestions = [],
  onTagAdd,
  onTagRemove,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
    if (trimmedTag === '') return;
    if (value.includes(trimmedTag)) return;
    if (maxTags && value.length >= maxTags) return;

    const newTags = [...value, trimmedTag];
    onChange(newTags);
    onTagAdd?.(trimmedTag);
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    if (disabled) return;
    
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
    onTagRemove?.(tagToRemove);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(suggestion)
  );

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-2 p-3 min-h-[42px] rounded-md border border-input bg-background',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`}
            variant="secondary"
            className="gap-1 pr-1.5"
          >
            <span className="text-xs">{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </Badge>
        ))}
        
        {(!maxTags || value.length < maxTags) && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay hiding suggestions to allow click events
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            onFocus={() => {
              if (filteredSuggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={value.length === 0 ? placeholder : ''}
            disabled={disabled}
            className={cn(
              'flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'min-w-[120px]'
            )}
          />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 z-50 max-h-[200px] overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion}-${index}`}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:bg-accent focus:text-accent-foreground'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {value.length} / {maxTags} tags
        </p>
      )}
    </div>
  );
}; 