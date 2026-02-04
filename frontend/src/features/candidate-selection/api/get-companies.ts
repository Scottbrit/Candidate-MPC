import { useQuery, queryOptions } from '@tanstack/react-query';
import type { QueryConfig } from '@/lib/react-query';

import { api } from '@/lib/api-client';
import type { Company } from '../types';

export const getCompanies = (): Promise<Company[]> => {
  return api.get('/me/companies');
};

export const getCompaniesQueryOptions = () => {
  return queryOptions({
    queryKey: ['candidate-companies'],
    queryFn: () => getCompanies(),
  });
};

type UseCompaniesOptions = {
  queryConfig?: QueryConfig<typeof getCompaniesQueryOptions>;
};

export const useCompanies = ({ queryConfig }: UseCompaniesOptions = {}) => {
  return useQuery({
    ...getCompaniesQueryOptions(),
    ...queryConfig,
  });
}; 