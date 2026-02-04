import { useDeleteCampaignStage } from '../api/delete-campaign-stage';
import { toast } from "react-toastify";

interface DeleteCampaignStepProps {
    campaignId: string;
    stepId: string;
}

export const DeleteCampaignStep = ({ campaignId, stepId }: DeleteCampaignStepProps) => {
    const { mutate: deleteCampaignStep } = useDeleteCampaignStage({
        campaign_id: campaignId,
        mutationConfig: {
            onSuccess: () => {
                toast.success('Campaign stage deleted successfully');
            },
            onError: (error) => {
                toast.error(`Something went wrong. ${error.message}`);
            },
        },
    });

    return (
        <button 
            onClick={() => deleteCampaignStep({ campaign_id: campaignId, step_id: stepId })}
            className="bg-white border hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm"
        >
            🗑️ Delete Stage
        </button>
    );
}