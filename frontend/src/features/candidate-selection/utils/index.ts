import type { Company } from '../types';

/**
 * Format employee count ranges for display
 */
export const formatEmployeeCount = (employeeCount: string | number | null | undefined): string => {
  if (!employeeCount) return 'N/A';
  
  // Convert to string if it's a number
  const employeeCountStr = typeof employeeCount === 'number' ? employeeCount.toString() : employeeCount;
  
  // Handle the format like "c_00011_00050"
  if (employeeCountStr.startsWith('c_')) {
    const parts = employeeCountStr.split('_');
    if (parts.length === 3) {
      const min = parseInt(parts[1], 10).toString();
      const max = parseInt(parts[2], 10).toString();
      return `${min}-${max} Employees`;
    }
  }
  
  // Handle the format like "00011-00050 Employees" 
  if (employeeCountStr.includes('-')) {
    const [min, max] = employeeCountStr.split('-');
    const cleanMin = parseInt(min, 10).toString();
    const cleanMax = parseInt(max, 10).toString();
    return `${cleanMin}-${cleanMax} Employees`;
  }
  
  return employeeCountStr;
};

/**
 * Format funding stage for display
 */
export const formatFundingStage = (stage: string): string => {
  if (!stage) return 'N/A';
  return stage.replace('_', ' ').toUpperCase();
};

/**
 * Format industry name for display
 */
export const formatIndustry = (industry: string): string => {
  if (!industry) return 'N/A';
  return industry
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get progress message based on selection count
 */
export const getProgressMessage = (count: number, maxSelections: number): string => {
  if (count === 0) return "Let's start selecting companies!";
  if (count <= Math.floor(maxSelections * 0.3)) return "Great start! Keep exploring!";
  if (count <= Math.floor(maxSelections * 0.6)) return "You're making excellent progress!";
  if (count <= Math.floor(maxSelections * 0.9)) return "Almost there! Looking good!";
  return `Perfect! You've selected ${maxSelections} companies!`;
};

/**
 * Get progress color based on selection count
 */
export const getProgressColor = (count: number, maxSelections: number): string => {
  if (count === 0) return "text-blue-600";
  if (count <= Math.floor(maxSelections * 0.3)) return "text-indigo-600";
  if (count <= Math.floor(maxSelections * 0.6)) return "text-purple-600";
  if (count <= Math.floor(maxSelections * 0.9)) return "text-pink-600";
  return "text-green-600";
};

/**
 * Check if a page has selected companies
 */
export const hasSelectedCompaniesInPage = (
  pageNum: number,
  companies: Company[],
  selectedCompanies: number[],
  companiesPerPage: number
): boolean => {
  const startIdx = (pageNum - 1) * companiesPerPage;
  const endIdx = startIdx + companiesPerPage;
  const companiesInPage = companies.slice(startIdx, endIdx);
  return companiesInPage.some(company => selectedCompanies.includes(company.id));
}; 