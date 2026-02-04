export interface Company {
  id: number;
  name: string;
  industry: string;
  short_description: string;
  latest_funding_stage: string;
  total_funding_printed: string;
  state: string;
  founded_year: number;
  estimated_num_employees: string | number | null;
  website_url: string;
  logo_url: string;
  approved_by_candidate: boolean;
}

export interface CompanySelection {
  company_id: number;
  approved_by_candidate: boolean;
}

export interface CompanyApprovalRequest {
  selections: CompanySelection[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  companiesPerPage: number;
  totalCompanies: number;
}

export interface CompanySelectionState {
  companies: Company[];
  selectedCompanies: number[];
  skippedCompanies: number[];
  currentPage: number;
  maxSelections: number;
  isLoading: boolean;
  error: string | null;
} 