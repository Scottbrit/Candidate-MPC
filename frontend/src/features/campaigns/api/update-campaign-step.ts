import { api } from '@/lib/api-client';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import type { MutationConfig } from '@/lib/react-query';
import { z } from 'zod';

export const updateCampaignStepInputSchema = z.object({
    campaign_id: z.string(),
    step_id: z.string(),
    step: z.object({
        subject: z.string(),
        message: z.string(),
        delay: z.number(),
    }),
});

export type UpdateCampaignStepInput = z.infer<typeof updateCampaignStepInputSchema>;

export const updateCampaignStep = ({ campaign_id, step_id, step }: UpdateCampaignStepInput) => {
    return api.put(`/campaigns/${campaign_id}/steps/${step_id}`, step);
};

type UseUpdateCampaignStepOptions = {
    campaignId: string;
    mutationConfig?: MutationConfig<typeof updateCampaignStep>;
};

export const useUpdateCampaignStep = ({ campaignId, mutationConfig }: UseUpdateCampaignStepOptions) => {
    const queryClient = useQueryClient();

    const { onSuccess, ...restConfig } = mutationConfig || {};

    return useMutation({
        onSuccess: (...args) => {
            queryClient.refetchQueries({ queryKey: ['campaign', campaignId] });
            onSuccess?.(...args);
        },
        ...restConfig,
        mutationFn: updateCampaignStep
    });
};
