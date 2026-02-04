import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Candidate } from '@/types/api';


export const updateCandidate = (id: number, data: FormData): Promise<Candidate> => {
    return api.put(`/candidates/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };


type UseUpdateCandidateOptions = {
    mutationConfig?: UseMutationOptions<Candidate, Error, { id: number; data: FormData }>;
};

export const useUpdateCandidate = ({ mutationConfig }: UseUpdateCandidateOptions = {}) => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: FormData }) => updateCandidate(id, data),
      onSuccess: (...args) => {
        queryClient.invalidateQueries({ queryKey: ['candidates'] });
        mutationConfig?.onSuccess?.(...args);
      },
      ...mutationConfig,
    });
  };
  