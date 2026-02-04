import { useQuery, queryOptions } from '@tanstack/react-query';
import type { QueryConfig } from '@/lib/react-query';

import { api } from '@/lib/api-client';
import type { Candidate } from '@/types/api';

export const getCandidate = ({
  candidateId,
}: {
  candidateId: number;
}): Promise<{ data: Candidate }> => {
  return api.get(`/candidates/${candidateId}`);
};

export const getCandidateQueryOptions = (candidateId: number) => {
  return queryOptions({
    queryKey: ['candidates', candidateId],
    queryFn: () => getCandidate({ candidateId }),
  });
};

type UseCandidateOptions = {
  candidateId: number;
  queryConfig?: QueryConfig<typeof getCandidateQueryOptions>;
};

export const useCandidate = ({
  candidateId,
  queryConfig,
}: UseCandidateOptions) => {
  return useQuery({
    ...getCandidateQueryOptions(candidateId),
    ...queryConfig,
  });
};
