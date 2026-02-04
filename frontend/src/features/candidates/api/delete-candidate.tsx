import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { Candidate } from '@/types/api';

export const deleteCandidate = (id: number): Promise<Candidate> => {
    return api.delete(`/candidates/${id}`);
};

type UseDeleteCandidateOptions = {
    mutationConfig?: UseMutationOptions<Candidate, Error, number>;
};

export const useDeleteCandidate = ({ mutationConfig }: UseDeleteCandidateOptions = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteCandidate,
        // Optimistic update: remove candidate immediately
        onMutate: async (candidateId: number) => {
            // Cancel any ongoing queries to prevent them from overriding our optimistic update
            await queryClient.cancelQueries({ queryKey: ['candidates'] });

            // Snapshot the current candidates list
            const previousCandidates = queryClient.getQueryData(['candidates']);

            // Optimistically remove the candidate from the list
            queryClient.setQueryData(['candidates'], (old: any) => {
                if (!old?.data) return old;
                
                return {
                    ...old,
                    data: old.data.filter((candidate: Candidate) => candidate.id !== candidateId)
                };
            });

            // Return context for potential rollback
            return { previousCandidates, candidateId };
        },
        // If mutation fails, rollback the optimistic update
        onError: (error, candidateId, context) => {
            // Restore the previous state
            if (context?.previousCandidates) {
                queryClient.setQueryData(['candidates'], context.previousCandidates);
            }
            
            // Call the original onError if provided
            mutationConfig?.onError?.(error, candidateId, context);
        },
        // On success, just call the original onSuccess
        onSuccess: (data, candidateId, context) => {
            mutationConfig?.onSuccess?.(data, candidateId, context);
        },
        // Always refetch to ensure data consistency
        onSettled: (data, error, candidateId, context) => {
            // Invalidate and refetch candidates to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            
            // Call the original onSettled if provided
            mutationConfig?.onSettled?.(data, error, candidateId, context);
        },
    });
};
