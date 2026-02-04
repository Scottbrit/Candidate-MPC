import { queryOptions, useQuery } from '@tanstack/react-query';
import type { QueryConfig } from '@/lib/react-query';

import { api } from '@/lib/api-client';
import type { Candidate } from '@/types/api';

export const getCandidates = (
  page = 1,
): Promise<{
  data: Candidate[];
}> => {
  return api.get(`/candidates`, {
    params: {
      page,
    },
  });
};

export const getCandidatesQueryOptions = ({
  page,
}: { page?: number } = {}) => {
  return queryOptions({
    queryKey: page ? ['candidates', { page }] : ['candidates'],
    queryFn: () => getCandidates(page),
  });
};

type UseCandidatesOptions = {
  page?: number;
  queryConfig?: QueryConfig<typeof getCandidatesQueryOptions>;
};

export const useCandidates = ({
  queryConfig,
  page,
}: UseCandidatesOptions) => {
  const options = {
    ...getCandidatesQueryOptions({ page }),
    ...queryConfig,
  };
  
  return useQuery(options);
};
