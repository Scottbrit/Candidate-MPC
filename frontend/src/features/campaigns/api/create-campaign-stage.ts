import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { MutationConfig } from '@/lib/react-query';
import { z } from 'zod';

export const createCampaignStageInputSchema = z.object({
    campaign_id: z.string()
});

export type CreateCampaignStageInput = z.infer<typeof createCampaignStageInputSchema>;

export const createCampaignStage = ({ campaign_id }: CreateCampaignStageInput) => {
  return api.post(`/campaigns/${campaign_id}/steps`);
};

type UseCreateCampaignStageOptions = {
  campaign_id: string;
  mutationConfig?: MutationConfig<typeof createCampaignStage>;
};

export const useCreateCampaignStage = ({
  campaign_id,
  mutationConfig,
}: UseCreateCampaignStageOptions) => {
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
    mutationFn: createCampaignStage,
  });
};