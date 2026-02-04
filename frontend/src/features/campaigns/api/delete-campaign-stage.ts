import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';
import { z } from 'zod';

export const deleteCampaignStageInputSchema = z.object({
    campaign_id: z.string(),
    step_id: z.string()
});

export type DeleteCampaignStageInput = z.infer<typeof deleteCampaignStageInputSchema>;

export const deleteCampaignStage = ({ campaign_id, step_id }: DeleteCampaignStageInput) => {
  return api.delete(`/campaigns/${campaign_id}/steps/${step_id}`);
};

type UseDeleteCampaignStageOptions = {
  campaign_id: string;
  mutationConfig?: MutationConfig<typeof deleteCampaignStage>;
};

export const useDeleteCampaignStage = ({
  campaign_id,
  mutationConfig,
}: UseDeleteCampaignStageOptions) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ['campaign', campaign_id],
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: deleteCampaignStage,
  });
};