import { useCreateCampaignStage } from '../api/create-campaign-stage';
import { toast } from "react-toastify";

interface CreateCampaignStageProps {
    campaignId: string;
}

export const CreateCampaignStage = ({ campaignId }: CreateCampaignStageProps) => {
    const { mutate: createCampaignStage } = useCreateCampaignStage({
        campaign_id: campaignId,
        mutationConfig: {
            onSuccess: () => {
                toast.success('Campaign stage created successfully');
            },
            onError: (error) => {
                toast.error(`Something went wrong. ${error.message}`);
            },
        },
    });

    return (
        <button 
            onClick={() => createCampaignStage({ campaign_id: campaignId })}
            className="bg-white border hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm"
        >
            + Add Stage
        </button>
    );
}