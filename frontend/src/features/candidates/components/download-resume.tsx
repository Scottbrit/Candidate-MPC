import { PDFIcon } from "@/components/ui/icons";
import type { Candidate } from "@/types/api";
import { downloadBlindedResume } from "../utils/pdf";
import { getActionTooltip, isResumeReady } from "../utils/processing-status";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";

interface DownloadResumeProps {
  candidate: Candidate;
  onDownload?: (candidate: Candidate) => void;
}

export const DownloadResume = ({ candidate, onDownload }: DownloadResumeProps) => {
  const isEnabled = isResumeReady(candidate.processing_status);
  const tooltipText = getActionTooltip('resume', candidate.processing_status);

  const handleDownload = async () => {
    if (!isEnabled) {
      console.warn("Resume is not ready for this candidate");
      return;
    }

    try {
      const candidateName = `${candidate.extracted_data?.candidate_first_name}`;
      
      // Check if extracted_data exists
      if (!candidate.extracted_data) {
        console.warn("No extracted data available for this candidate");
        // You might want to show a toast notification here
        return;
      }
      
      await downloadBlindedResume({ 
        data: candidate.extracted_data, 
        role: candidate.role,
        name: candidateName 
      });
      
      onDownload?.(candidate);
    } catch (error) {
      console.error("Error downloading resume:", error);
      // You might want to show a toast notification here
    }
  };

  return (
    <Tooltip text={tooltipText} position="left">
      <button 
        className={`${
          isEnabled 
            ? "text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white/90 cursor-pointer" 
            : "text-gray-300 cursor-not-allowed dark:text-gray-600"
        }`}
        onClick={isEnabled ? handleDownload : undefined}
        disabled={!isEnabled}
      >
        <PDFIcon className="size-5" />
      </button>
    </Tooltip>
  );
}; 