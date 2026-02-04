import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Candidate } from '@/types/api';

export const createCandidate = (data: FormData): Promise<Candidate> => {
    return api.post('/candidates', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

type UseCreateCandidateOptions = {
    mutationConfig?: UseMutationOptions<Candidate, Error, FormData>;
};

export const useCreateCandidate = ({ mutationConfig }: UseCreateCandidateOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createCandidate,
        onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: ['candidates'] });
        mutationConfig?.onSuccess?.(...args);
        },
        ...mutationConfig,
    });
    };
