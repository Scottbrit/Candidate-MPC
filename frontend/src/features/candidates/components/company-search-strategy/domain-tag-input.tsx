import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { validateDomain } from './utils';

interface DomainTagInputProps {
  domains: string[];
  onChange: (domains: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const DomainTagInput: React.FC<DomainTagInputProps> = ({
  domains,
  onChange,
  placeholder = "Type domain and press Enter...",
  disabled = false,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState('');
  const [focusedTagIndex, setFocusedTagIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addDomain = (domain: string) => {
    const trimmedDomain = domain.trim().toLowerCase();
    
    // Don't add empty or duplicate domains
    if (!trimmedDomain || domains.includes(trimmedDomain)) {
      return;
    }

    onChange([...domains, trimmedDomain]);
    setInputValue('');
  };

  const removeDomain = (indexToRemove: number) => {
    onChange(domains.filter((_, index) => index !== indexToRemove));
    setFocusedTagIndex(null);
    // Focus back to input after removal
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addDomain(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && domains.length > 0) {
      // Remove last domain when backspace is pressed on empty input
      removeDomain(domains.length - 1);
    } else if (e.key === 'Escape') {
      setInputValue('');
      setFocusedTagIndex(null);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  // Auto-focus input when component mounts
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <div
      className={`
        min-h-[44px] w-full rounded-lg border px-3 py-2 text-sm shadow-theme-xs
        flex flex-wrap items-center gap-2 cursor-text transition-colors
        ${disabled 
          ? 'bg-gray-100 opacity-50 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
          : 'bg-transparent border-gray-300 focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:focus-within:border-brand-800'
        }
        ${className}
      `}
      onClick={handleContainerClick}
    >
      {/* Domain Tags */}
      {domains.map((domain, index) => {
        const isValid = validateDomain(domain);
        return (
          <span
            key={index}
            className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
              transition-all duration-200 max-w-full
              ${isValid 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }
              ${focusedTagIndex === index ? 'ring-2 ring-blue-500/30' : ''}
              ${disabled ? 'opacity-50' : 'hover:bg-opacity-80'}
            `}
          >
            <span className="truncate max-w-[200px]" title={domain}>
              {domain}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeDomain(index);
                }}
                className={`
                  flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center
                  transition-colors hover:bg-black/10 dark:hover:bg-white/10
                  ${isValid ? 'text-blue-600 dark:text-blue-300' : 'text-red-600 dark:text-red-300'}
                `}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </span>
        );
      })}

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={domains.length === 0 ? placeholder : ""}
        disabled={disabled}
        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
      />
    </div>
  );
}; 