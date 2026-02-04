import { PaperPlaneIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import type { Candidate } from "@/types/api";
import { useCreateCampaign } from "../api/create-campaign";
import { canCreateCampaign, getActionTooltip } from "../utils/processing-status";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { toast } from "react-toastify";
import { useState } from "react";

interface CreateCampaignProps {
  candidate: Candidate;
  onCampaignCreated?: (candidate: Candidate) => void;
}

export const CreateCampaign = ({ candidate, onCampaignCreated }: CreateCampaignProps) => {
  const { isOpen, openModal, closeModal } = useModal();
  
  // Computed default value that always reflects current candidate
  const defaultCampaignName = `${candidate.first_name} ${candidate.last_name} - Campaign`;
  const [campaignName, setCampaignName] = useState('');
  
  const createCampaignMutation = useCreateCampaign({
    mutationConfig: {
      onSuccess: () => {
        toast.success(`Campaign created successfully for ${candidate.first_name} ${candidate.last_name}`);
        onCampaignCreated?.(candidate);
        closeModal();
        setCampaignName('');
      },
      onError: (error) => {
        console.error("Error creating campaign:", error);
        toast.error(`Failed to create campaign for ${candidate.first_name} ${candidate.last_name}. Please try again.`);
      },
    },
  });

  const handleOpenModal = () => {
    setCampaignName(defaultCampaignName);
    openModal();
  };

  const handleCreateCampaign = () => {
    if (!campaignName.trim()) {
      toast.error("Please enter a campaign name");
      return;
    }

    createCampaignMutation.mutate({
      name: campaignName.trim(),
      candidate_id: candidate.id,
    });
  };

  const handleModalClose = () => {
    closeModal();
    setCampaignName(''); // Reset form on close
  };

  const isEnabled = canCreateCampaign(candidate.processing_status);
  const tooltipText = getActionTooltip('campaign', candidate.processing_status);

  return (
    <>
      <Tooltip text={tooltipText} position="left">
        <button 
          className={`${
            isEnabled 
              ? "text-black hover:text-blue-800 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer" 
              : "text-gray-300 cursor-not-allowed dark:text-gray-600"
          }`}
          onClick={isEnabled ? handleOpenModal : undefined}
          disabled={!isEnabled}
        >
          <PaperPlaneIcon className="size-5" />
        </button>
      </Tooltip>

      <Modal
        isOpen={isOpen}
        onClose={handleModalClose}
        className="max-w-[600px] p-5 lg:p-10"
        showCloseButton={false}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/20">
            <PaperPlaneIcon className="size-5 text-brand-600 dark:text-brand-400" />
          </div>
          <h4 className="font-semibold text-gray-800 text-title-sm dark:text-white/90">
            Create Campaign
          </h4>
        </div>
        
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          Create a new outreach campaign for <strong>{candidate.first_name} {candidate.last_name}</strong>.
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
          This will create a campaign with the decision makers found for this candidate.
        </p>

        <div className="mt-6">
          <label 
            htmlFor="campaignName" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Campaign Name
          </label>
          <input
            id="campaignName"
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400"
            placeholder={defaultCampaignName}
            disabled={createCampaignMutation.isPending}
          />
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-8">
          <Button size="sm" variant="outline" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleCreateCampaign}
            disabled={createCampaignMutation.isPending || !campaignName.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white"
            startIcon={createCampaignMutation.isPending ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : undefined}
          >
            {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
          </Button>
        </div>
      </Modal>
    </>
  );
};
