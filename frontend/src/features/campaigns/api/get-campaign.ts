import { useQuery, queryOptions } from '@tanstack/react-query';
import type { QueryConfig } from '@/lib/react-query';

import { api } from '@/lib/api-client';
import type { Campaign } from '@/features/campaigns/api/get-campaigns';

export const getCampaign = ({
    campaignId,
}: {
    campaignId: string;
}): Promise<{ campaign: Campaign }> => {
    return api.get(`/campaigns/${campaignId}`);
  };
  
  export const getCampaignQueryOptions = (campaignId: string) => {
    return queryOptions({
      queryKey: ['campaign', campaignId],
      queryFn: () => getCampaign({ campaignId }),
    });
  };
  
  type UseCampaignOptions = {
    campaignId: string;
    queryConfig?: QueryConfig<typeof getCampaignQueryOptions>;
  };
  
  export const useCampaign = ({
    campaignId,
    queryConfig,
  }: UseCampaignOptions) => {
    return useQuery({
      ...getCampaignQueryOptions(campaignId),
      ...queryConfig,
    });
  };
  