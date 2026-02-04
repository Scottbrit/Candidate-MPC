import { queryOptions, useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { FathomTranscriptResponse } from '../types';

export const getFathomTranscript = (email: string): Promise<FathomTranscriptResponse> => {
  return api.get(`/fathom/transcript`, {
    params: { email },
  });
};

export const getFathomTranscriptQueryOptions = (email: string) => {
  return queryOptions({
    queryKey: ['fathom-transcript', email],
    queryFn: () => getFathomTranscript(email),
    enabled: false, // Only run when manually triggered
  });
};

export const useFathomTranscriptSearch = (
  options: UseMutationOptions<FathomTranscriptResponse, Error, string> = {}
) => {
  return useMutation({
    mutationFn: (email: string) => getFathomTranscript(email),
    ...options,
  });
};