import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { CompanySelection } from '../types';
import { getCompaniesQueryOptions } from './get-companies';

export const approveCompanies = (selections: CompanySelection[]): Promise<void> => {
  return api.post('/me/companies/approve', selections);
};

type UseApproveCompaniesOptions = {
  mutationConfig?: UseMutationOptions<void, Error, CompanySelection[]>;
};

export const useApproveCompanies = ({ mutationConfig }: UseApproveCompaniesOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveCompanies,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ 
        queryKey: getCompaniesQueryOptions().queryKey 
      });
      mutationConfig?.onSuccess?.(...args);
    },
    ...mutationConfig,
  });
}; 