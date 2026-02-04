import Badge from '@/components/ui/badge/Badge';
import { getStatusText, getStatusClass, isProcessing } from '../utils/processing-status';
import type { ProcessingStatus } from '@/types/api';

interface StatusBadgeProps {
  status: ProcessingStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusBadge = ({ 
    status, 
    size = 'sm',
    showIcon = true 
  }: StatusBadgeProps) => {
    const statusText = getStatusText(status);
    const statusClass = getStatusClass(status);
    const processing = isProcessing(status);
  
    return (
      <Badge
        size={size}
        className={statusClass}
        startIcon={showIcon && processing ? (
          <div className="h-2 w-2 rounded-full bg-current animate-pulse" />
        ) : undefined}
      >
        {statusText}
      </Badge>
    );
  };
