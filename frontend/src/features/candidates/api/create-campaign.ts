import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export interface CampaignCreateRequest {
    name: string;
    candidate_id: number;
}

export interface CampaignCreateResponse {
    id: number;
    lemlist_campaign_id: string;
    name: string;
    candidate_id: number;
    state: string;
    created_at: string;
}

export const createCampaign = (data: CampaignCreateRequest): Promise<CampaignCreateResponse> => {
    return api.post('/campaigns', data);
};

type UseCreateCampaignOptions = {
    mutationConfig?: UseMutationOptions<CampaignCreateResponse, Error, CampaignCreateRequest>;
};

export const useCreateCampaign = ({ mutationConfig }: UseCreateCampaignOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCampaign,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            mutationConfig?.onSuccess?.(...args);
        },
        ...mutationConfig,
    });
};
