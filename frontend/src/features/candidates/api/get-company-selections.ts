import { useQuery, queryOptions } from '@tanstack/react-query';
import type { QueryConfig } from '@/lib/react-query';

import { api } from '@/lib/api-client';

// Type for the company selection response based on backend data structure
export type CompanySelection = {
  approved_by_candidate: boolean;
  companies_apollo: {
    id: number;
    name: string;
    city?: string;
    state?: string;
    country?: string;
    industry?: string;
    logo_url?: string;
    website_url?: string;
    founded_year?: number;
    short_description?: string;
    latest_funding_stage?: string;
    total_funding_printed?: string;
    estimated_num_employees?: number;
    company_decision_makers_apollo: Array<{
      email?: string;
      title: string;
      last_name: string;
      first_name: string;
      linkedin_url?: string;
      photo_url?: string;
    }>;
  };
};

export type CompanySelectionsResponse = {
  data: CompanySelection[];
};

export const getCompanySelections = ({
  candidateId,
}: {
  candidateId: number;
}): Promise<CompanySelectionsResponse> => {
  return api.get(`/candidates/${candidateId}/company_selections`);
};

export const getCompanySelectionsQueryOptions = (candidateId: number) => {
  return queryOptions({
    queryKey: ['candidates', candidateId, 'company-selections'],
    queryFn: () => getCompanySelections({ candidateId }),
  });
};

type UseCompanySelectionsOptions = {
  candidateId: number;
  queryConfig?: QueryConfig<typeof getCompanySelectionsQueryOptions>;
};

export const useCompanySelections = ({
  candidateId,
  queryConfig,
}: UseCompanySelectionsOptions) => {
  return useQuery({
    ...getCompanySelectionsQueryOptions(candidateId),
    ...queryConfig,
  });
}; 