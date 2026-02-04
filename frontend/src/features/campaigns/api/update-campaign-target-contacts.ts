import { api } from '@/lib/api-client';
import { useMutation, useQueryClient} from '@tanstack/react-query';
import type { MutationConfig } from '@/lib/react-query';
import { z } from 'zod';

export const updateCampaignTargetContactsInputSchema = z.object({
    campaignId: z.string(),
    lead_id: z.string(),
    variables: z.object({
    primary_decision_maker: z.string().optional(),
    primary_decision_maker_first_name: z.string().optional(),
    primary_decision_maker_last_name: z.string().optional(),
    primary_decision_maker_job_title: z.string().optional(),
    primary_decision_maker_linkedin_url: z.string().optional(),
    cc_decision_maker_1: z.string().optional(),
    cc_decision_maker_1_first_name: z.string().optional(),
    cc_decision_maker_1_last_name: z.string().optional(),
    cc_decision_maker_1_job_title: z.string().optional(),
    cc_decision_maker_1_linkedin_url: z.string().optional(),
    cc_decision_maker_2: z.string().optional(),
    cc_decision_maker_2_first_name: z.string().optional(),
    cc_decision_maker_2_last_name: z.string().optional(),
    cc_decision_maker_2_job_title: z.string().optional(),
    cc_decision_maker_2_linkedin_url: z.string().optional(),
    alt_decision_maker_1: z.string().optional(),
    alt_decision_maker_1_first_name: z.string().optional(),
    alt_decision_maker_1_last_name: z.string().optional(),
    alt_decision_maker_1_job_title: z.string().optional(),
    alt_decision_maker_1_linkedin_url: z.string().optional(),
    alt_decision_maker_2: z.string().optional(),
    alt_decision_maker_2_first_name: z.string().optional(),
    alt_decision_maker_2_last_name: z.string().optional(),
    alt_decision_maker_2_job_title: z.string().optional(),
    alt_decision_maker_2_linkedin_url: z.string().optional(),
    is_call_booked: z.string().optional(),
    is_agreement_sent: z.string().optional(),
    is_agreement_signed: z.string().optional()
    }),
});

export type UpdateCampaignTargetContactsInput = z.infer<typeof updateCampaignTargetContactsInputSchema>;

export const updateCampaignTargetContacts = ({ campaignId, lead_id, variables }: UpdateCampaignTargetContactsInput) => {
    return api.post(`/campaigns/${campaignId}/leads/${lead_id}/variables`, variables);
};

type UseUpdateCampaignTargetContactsOptions = {
    campaignId: string;
    mutationConfig?: MutationConfig<typeof updateCampaignTargetContacts>;
};

export const useUpdateCampaignTargetContacts = ({ campaignId, mutationConfig }: UseUpdateCampaignTargetContactsOptions) => {
    const queryClient = useQueryClient();

    const { onSuccess, ...restConfig } = mutationConfig || {};

    return useMutation({
        onSuccess: (...args) => {
            queryClient.refetchQueries({ queryKey: ['campaign', campaignId] });
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            onSuccess?.(...args);
        },
        ...restConfig,
        mutationFn: updateCampaignTargetContacts
    });
};
