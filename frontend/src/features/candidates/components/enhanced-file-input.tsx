import { useRef } from 'react';
import type { RefObject } from 'react';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
// Using a simple external link icon inline instead of react-icons

interface EnhancedFileInputProps {
  label: string;
  id: string;
  accept?: string;
  required?: boolean;
  error?: string | null;
  filename?: string | null;
  buttonContent: string;
  onButtonClick: () => void;
  buttonDisabled: boolean;
  buttonColor?: string;
  onChange: (file: File | null) => void;
  tooltipContent?: string;
  fileInputRef?: RefObject<HTMLInputElement | null>;
  showExternalIcon?: boolean;
}

export const EnhancedFileInput: React.FC<EnhancedFileInputProps> = ({
  label,
  id,
  accept = '.pdf',
  required = false,
  error,
  filename,
  buttonContent,
  onButtonClick,
  buttonDisabled,
  buttonColor,
  onChange,
  tooltipContent,
  fileInputRef,
  showExternalIcon = false,
}) => {
  const internalRef = useRef<HTMLInputElement>(null);
  const inputRef = fileInputRef || internalRef;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const getDisplayValue = () => {
    if (filename) return filename;
    return 'Select File';
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="sr-only"
          />
          
          <div
            className={`
              h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs
              flex items-center justify-between cursor-pointer
              ${error 
                ? 'border-red-500 focus:border-red-300 focus:ring-red-500/20' 
                : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/20'
              }
              bg-transparent text-gray-800 dark:border-gray-700 dark:text-white/90 
              dark:focus:border-brand-800 hover:bg-gray-50 dark:hover:bg-gray-800/50
            `}
            onClick={() => inputRef.current?.click()}
          >
            <span className={filename ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 dark:text-gray-400'}>
              {getDisplayValue()}
            </span>
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </div>
        </div>

        <div className="relative">
                     <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onButtonClick}
            disabled={buttonDisabled}
            className={`
              whitespace-nowrap h-11 flex items-center gap-2
              ${buttonColor || ''}
              ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {buttonContent}
            {showExternalIcon && (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            )}
          </Button>
          
          {tooltipContent && buttonDisabled && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              {tooltipContent}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}; 