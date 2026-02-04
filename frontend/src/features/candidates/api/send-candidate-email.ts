import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Candidate } from '@/types/api';

export const sendCandidateMagicLink = (id: number): Promise<Candidate> => {
    return api.post(`/candidates/${id}/send_magic_link`);
};

type UseSendCandidateMagicLinkOptions = {
    mutationConfig?: UseMutationOptions<Candidate, Error, number>;
};

export const useSendCandidateMagicLink = ({ mutationConfig }: UseSendCandidateMagicLinkOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendCandidateMagicLink,
        onSuccess: (...args) => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            mutationConfig?.onSuccess?.(...args);
        },
        ...mutationConfig,
    });
}; 