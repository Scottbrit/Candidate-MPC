import { type ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export const Tooltip = ({ 
  children, 
  text, 
  position = 'left',
  className = ''
}: TooltipProps) => {
  const getTooltipPositionClasses = () => {
    switch (position) {
      case 'left':
        return {
          container: 'right-full top-1/2 mr-2.5 -translate-y-1/2',
          arrow: '-right-1.5 top-1/2 -translate-y-1/2'
        };
      case 'right':
        return {
          container: 'left-full top-1/2 ml-2.5 -translate-y-1/2',
          arrow: '-left-1.5 top-1/2 -translate-y-1/2'
        };
      case 'top':
        return {
          container: 'bottom-full left-1/2 mb-2.5 -translate-x-1/2',
          arrow: '-bottom-1 left-1/2 -translate-x-1/2'
        };
      case 'bottom':
        return {
          container: 'top-full left-1/2 mt-2.5 -translate-x-1/2',
          arrow: '-top-1 left-1/2 -translate-x-1/2'
        };
      default:
        return {
          container: 'right-full top-1/2 mr-2.5 -translate-y-1/2',
          arrow: '-right-1.5 top-1/2 -translate-y-1/2'
        };
    }
  };

  const { container, arrow } = getTooltipPositionClasses();

  return (
    <div className={`relative inline-flex group ${className}`}>
      {children}
      <div className={`invisible absolute ${container} z-30 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100`}>
        <div className="relative">
          <div className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-medium text-white drop-shadow-4xl dark:bg-gray-900 dark:text-white">
            {text}
          </div>
          <div className={`absolute ${arrow} h-3 w-4 rotate-45 bg-gray-900 dark:bg-gray-900`}></div>
        </div>
      </div>
    </div>
  );
};