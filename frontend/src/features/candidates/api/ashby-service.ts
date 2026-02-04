import { queryOptions, useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { AshbyResumeResponse } from '../types';

export const getAshbyResume = (email: string): Promise<AshbyResumeResponse> => {
  return api.get(`/ashby/resume`, {
    params: { email },
  });
};

export const getAshbyResumeQueryOptions = (email: string) => {
  return queryOptions({
    queryKey: ['ashby-resume', email],
    queryFn: () => getAshbyResume(email),
    enabled: false, // Only run when manually triggered
  });
};

export const useAshbyResumeSearch = (
  options: UseMutationOptions<AshbyResumeResponse, Error, string> = {}
) => {
  return useMutation({
    mutationFn: (email: string) => getAshbyResume(email),
    ...options,
  });
}; 