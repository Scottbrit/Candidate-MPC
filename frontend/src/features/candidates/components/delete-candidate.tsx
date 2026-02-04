import { TrashBinIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useModal } from "@/hooks/useModal";
import type { Candidate } from "@/types/api";
import { useDeleteCandidate } from "../api/delete-candidate";
import { toast } from "react-toastify";

interface DeleteCandidateProps {
  candidate: Candidate;
  onDelete?: (candidate: Candidate) => void;
}

export const DeleteCandidate = ({ candidate, onDelete }: DeleteCandidateProps) => {
  const { isOpen, openModal, closeModal } = useModal();
  
  const deleteCandidateMutation = useDeleteCandidate({
    mutationConfig: {
      onSuccess: () => {
        toast.success(`${candidate.first_name} ${candidate.last_name} has been deleted successfully`);
        onDelete?.(candidate);
        closeModal();
        
        // Optional: Add toast notification here
        // toast.success(`${candidate.first_name} ${candidate.last_name} has been deleted successfully`);
      },
      onError: (error) => {
        console.error("Error deleting candidate:", error);
        toast.error(`Failed to delete ${candidate.first_name} ${candidate.last_name}. Please try again.`);
        
        // Optional: Add error toast notification here
        // toast.error(`Failed to delete ${candidate.first_name} ${candidate.last_name}. Please try again.`);
        
        // Keep modal open so user can retry
      },
    },
  });

  const handleDelete = () => {
    deleteCandidateMutation.mutate(candidate.id);
  };

  return (
    <>
      <button 
        className="text-black hover:text-red-800 dark:text-gray-400 dark:hover:text-error-500 transition-colors"
        onClick={openModal}
        title="Delete Candidate"
        disabled={deleteCandidateMutation.isPending}
      >
        <TrashBinIcon className="size-5" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10"
        showCloseButton={false}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-error-100 dark:bg-error-900/20">
            <TrashBinIcon className="size-5 text-error-600 dark:text-error-400" />
          </div>
          <h4 className="font-semibold text-gray-800 text-title-sm dark:text-white/90">
            Delete Candidate
          </h4>
        </div>
        
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to delete <strong>{candidate.first_name} {candidate.last_name}</strong>? 
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
          This action cannot be undone and the candidate will be removed immediately.
        </p>

        {deleteCandidateMutation.isError && (
          <div className="p-3 mt-4 rounded-lg bg-error-50 dark:bg-error-900/20">
            <p className="text-sm text-error-600 dark:text-error-400">
              Failed to delete candidate. Please try again.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end w-full gap-3 mt-8">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={closeModal}
            disabled={deleteCandidateMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleDelete}
            disabled={deleteCandidateMutation.isPending}
            className="bg-error-600 hover:bg-error-700 disabled:bg-error-400 text-white"
            startIcon={deleteCandidateMutation.isPending ? (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : undefined}
          >
            {deleteCandidateMutation.isPending ? 'Deleting...' : 'Delete Candidate'}
          </Button>
        </div>
      </Modal>
    </>
  );
}; 