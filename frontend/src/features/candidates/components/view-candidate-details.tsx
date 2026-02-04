import { EyeIcon } from "@/components/ui/icons";
import type { Candidate } from "@/types/api";
import { useNavigate } from 'react-router';
import { paths } from '@/config/paths';
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { canViewDetails, getActionTooltip } from "../utils/processing-status";

interface ViewCandidateDetailsProps {
  candidate: Candidate;
  onViewDetails?: (candidate: Candidate) => void;
}

export const ViewCandidateDetails = ({ candidate, onViewDetails }: ViewCandidateDetailsProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(paths.app.updateCandidate.getHref(candidate.id.toString()));
    onViewDetails?.(candidate);
  };

  const isEnabled = canViewDetails(candidate.processing_status);
  const tooltipText = getActionTooltip('view', candidate.processing_status);

  return (
    <Tooltip text={tooltipText} position="left">
      <button 
        className={`${
          isEnabled 
            ? "text-black hover:text-red-800 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer" 
            : "text-gray-300 cursor-not-allowed dark:text-gray-600"
        }`}
        onClick={isEnabled ? handleViewDetails : undefined}
        disabled={!isEnabled}
        title="View Details"
      >
        <EyeIcon className="size-5" />
      </button>
    </Tooltip>
  );
}; 