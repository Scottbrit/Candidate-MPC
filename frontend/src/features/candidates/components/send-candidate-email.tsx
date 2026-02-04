import { EmailIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import type { Candidate } from "@/types/api";
import { useSendCandidateMagicLink } from "../api/send-candidate-email";
import { canSendMagicLink, getActionTooltip } from "../utils/processing-status";
import { Tooltip } from "@/components/ui/tooltip/Tooltip";
import { toast } from "react-toastify";


interface SendCandidateEmailProps {
  candidate: Candidate;
  onEmailSent?: (candidate: Candidate) => void;
}

export const SendCandidateEmail = ({ candidate, onEmailSent }: SendCandidateEmailProps) => {
  const { isOpen, openModal, closeModal } = useModal();
  
  const sendMagicLinkMutation = useSendCandidateMagicLink({
    mutationConfig: {
      onSuccess: () => {
        toast.success(`Magic link sent successfully to: ${candidate.first_name} ${candidate.last_name}`);
        onEmailSent?.(candidate);
        closeModal();
      },
      onError: (error) => {
        console.error("Error sending magic link:", error);
        toast.error(`Failed to send magic link to ${candidate.first_name} ${candidate.last_name}. Please try again.`);
      },
    },
  });

  const handleSendMagicLink = () => {
    sendMagicLinkMutation.mutate(candidate.id);
  };

  const isEnabled = canSendMagicLink(candidate.processing_status);
  const tooltipText = getActionTooltip('email', candidate.processing_status);

  return (
    <>
      <Tooltip text={tooltipText} position="left">
        <button 
          className={`${
            isEnabled 
              ? "text-black hover:text-red-800 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer" 
              : "text-gray-300 cursor-not-allowed dark:text-gray-600"
          }`}
          onClick={isEnabled ? openModal : undefined}
          disabled={!isEnabled}
        >
          <EmailIcon className="size-5" />
        </button>
      </Tooltip>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10"
        showCloseButton={false}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20">
            <EmailIcon className="size-5 text-brand-600 dark:text-brand-400" />
          </div>
          <h4 className="font-semibold text-gray-800 text-title-sm dark:text-white/90">
            Send Magic Link
          </h4>
        </div>
        
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to send a magic link to <strong>{candidate.first_name} {candidate.last_name}</strong>?
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
          The magic link will be sent to: <strong>{candidate.email}</strong>
        </p>

        <div className="flex items-center justify-end w-full gap-3 mt-8">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSendMagicLink}
            disabled={sendMagicLinkMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white"
            startIcon={sendMagicLinkMutation.isPending ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : undefined}
          >
            {sendMagicLinkMutation.isPending ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </div>
      </Modal>
    </>
  );
};
