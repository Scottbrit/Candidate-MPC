import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useCompanies } from '../api/get-companies';
import { useApproveCompanies } from '../api/approve-companies';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { paths } from '@/config/paths';
import {
  formatEmployeeCount,
  formatFundingStage,
  formatIndustry,
  getProgressMessage,
  getProgressColor,
  hasSelectedCompaniesInPage,
} from '../utils';

// Company Logo Component
const CompanyLogo = ({ company, size = 'sm' }: { company: any; size?: 'sm' | 'md' }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const sizeClasses = size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
  const textSizes = size === 'md' ? 'text-lg' : 'text-sm';
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-red-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!company.logo_url || imageError) {
    return (
      <div className={`${sizeClasses} ${getBackgroundColor(company.name)} rounded-sm flex items-center justify-center flex-shrink-0`}>
        <span className={`${textSizes} font-semibold text-white`}>
          {getInitials(company.name)}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} flex-shrink-0 relative`}>
      {imageLoading && (
        <div className={`${sizeClasses} ${getBackgroundColor(company.name)} rounded-sm flex items-center justify-center absolute inset-0`}>
          <span className={`${textSizes} font-semibold text-white`}>
            {getInitials(company.name)}
          </span>
        </div>
      )}
      <img 
        src={company.logo_url} 
        alt={`${company.name} logo`}
        className={`${sizeClasses} object-contain rounded-sm ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
};

const MAX_SELECTIONS = 10;
const COMPANIES_PER_PAGE = 5;

export default function CompanySelectionPage() {
  const navigate = useNavigate();
  const warningRef = useRef<HTMLDivElement>(null);
  
  const [selectedCompanies, setSelectedCompanies] = useState<number[]>([]);
  const [skippedCompanies, setSkippedCompanies] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  
  const { isOpen, openModal, closeModal } = useModal();
  
  const companiesQuery = useCompanies();
  const approveCompaniesMutation = useApproveCompanies({
    mutationConfig: {
      onSuccess: () => {
        closeModal();
        // Navigate to thank you page
        navigate(paths.app.thankYou.getHref());
      },
      onError: (error) => {
        console.error('Error submitting selections:', error);
        // You might want to show a toast notification here
      },
    },
  });

  // Initialize selected companies from API data
  const companies = useMemo(() => companiesQuery.data || [], [companiesQuery.data]);
  const filteredCompanies = companies.filter(company => !skippedCompanies.includes(company.id));

  // Set initial selections from API data using useEffect
  useEffect(() => {
    if (companiesQuery.isSuccess && selectedCompanies.length === 0 && companies.length > 0) {
      const preSelected = companies
        .filter(company => company.approved_by_candidate)
        .map(company => company.id);
      
      if (preSelected.length > 0) {
        setSelectedCompanies(preSelected);
      }
    }
  }, [companiesQuery.isSuccess, companies, selectedCompanies.length]);

  const handleApproveCompany = (companyId: number) => {
    if (approveCompaniesMutation.isPending) return;

    if (selectedCompanies.includes(companyId)) {
      setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
      setShowMaxWarning(false);
    } else if (selectedCompanies.length >= MAX_SELECTIONS) {
      setShowMaxWarning(true);
      warningRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center'
      });
      setTimeout(() => {
        setShowMaxWarning(false);
      }, 3000);
    } else {
      setSelectedCompanies([...selectedCompanies, companyId]);
      setShowMaxWarning(false);
    }
  };

  const handleSkipCompany = (companyId: number) => {
    if (approveCompaniesMutation.isPending) return;

    setSkippedCompanies([...skippedCompanies, companyId]);
    
    // Calculate if current page will be empty after removal
    const updatedCompanies = filteredCompanies.filter(company => company.id !== companyId);
    const updatedTotalPages = Math.ceil(updatedCompanies.length / COMPANIES_PER_PAGE);
    if (currentPage > updatedTotalPages && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSubmitSelections = async () => {
    const selectionsData = companies.map(company => ({
      company_id: company.id,
      approved_by_candidate: selectedCompanies.includes(company.id)
    }));
    
    await approveCompaniesMutation.mutateAsync(selectionsData);
  };

  // Pagination calculations
  const indexOfLastCompany = currentPage * COMPANIES_PER_PAGE;
  const indexOfFirstCompany = indexOfLastCompany - COMPANIES_PER_PAGE;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(filteredCompanies.length / COMPANIES_PER_PAGE);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top of companies table
    document.querySelector('.companies-table')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  // Render pagination with selection indicators
  const renderPaginationButtons = () => {
    const pageNumbers: React.ReactNode[] = [];
    const maxVisiblePages = 5;

    const renderPageButton = (pageNum: number) => {
      const hasSelections = hasSelectedCompaniesInPage(
        pageNum, 
        filteredCompanies, 
        selectedCompanies, 
        COMPANIES_PER_PAGE
      );
      
      return (
        <button
          key={pageNum}
          onClick={() => handlePageChange(pageNum)}
          disabled={currentPage === pageNum}
          className={`relative w-10 h-10 flex items-center justify-center rounded-md mr-2 ${
            currentPage === pageNum
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {pageNum}
          {hasSelections && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white" />
          )}
        </button>
      );
    };

    // Always show first page
    if (currentPage > 1) {
      pageNumbers.push(renderPageButton(1));
    }

    // Show ellipsis after first page if needed
    if (currentPage > maxVisiblePages - 1) {
      pageNumbers.push(
        <span key="ellipsis-start" className="mx-2">
          ...
        </span>
      );
    }

    // Calculate range of pages to show around current page
    let startPage = Math.max(currentPage - Math.floor(maxVisiblePages / 2), 2);
    const endPage = Math.min(startPage + maxVisiblePages - 3, totalPages - 1);
    
    if (endPage - startPage < maxVisiblePages - 3) {
      startPage = Math.max(2, endPage - maxVisiblePages + 3);
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(renderPageButton(i));
    }

    // Show ellipsis before last page if needed
    if (currentPage < totalPages - (maxVisiblePages - 2)) {
      pageNumbers.push(
        <span key="ellipsis-end" className="mx-2">
          ...
        </span>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(renderPageButton(totalPages));
    }

    return (
      <div className="flex items-center space-x-1">
        {/* Previous Page Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center rounded-md mr-2 bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ←
        </button>

        {pageNumbers}

        {/* Next Page Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    );
  };

  if (companiesQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (companiesQuery.isError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">
            Failed to load companies. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-2">Company Selection</h1>
        <p className="text-gray-600 text-sm lg:text-base">
          Please review the list of companies below and select up to {MAX_SELECTIONS} that you are interested in.
          Approved companies will be highlighted in green.
        </p>
        
        {/* Warning Message */}
        {showMaxWarning && (
          <div 
            ref={warningRef}
            className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-semibold">Maximum limit reached</span>
            </div>
            <p className="mt-1 ml-7 text-sm">
              You can only select up to {MAX_SELECTIONS} companies. Please remove a selection before adding another.
            </p>
          </div>
        )}
        
        {/* Progress Section */}
        <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 lg:p-6">
          {/* Progress Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="text-gray-700 font-semibold text-base lg:text-lg">
                {selectedCompanies.length}/{MAX_SELECTIONS} Companies Selected
              </div>
            </div>
            <div className={`${getProgressColor(selectedCompanies.length, MAX_SELECTIONS)} font-medium text-sm lg:text-base transition-colors duration-300`}>
              {getProgressMessage(selectedCompanies.length, MAX_SELECTIONS)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4 lg:h-5 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm" 
                style={{ width: `${(selectedCompanies.length / MAX_SELECTIONS) * 100}%` }}
              ></div>
            </div>
            {/* Progress percentage text */}
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 mix-blend-multiply">
                {Math.round((selectedCompanies.length / MAX_SELECTIONS) * 100)}%
              </span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs lg:text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Selected: {selectedCompanies.length}</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
              <span>Remaining: {MAX_SELECTIONS - selectedCompanies.length}</span>
            </div>
            {skippedCompanies.length > 0 && (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                <span>Skipped: {skippedCompanies.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6 companies-table">
        {/* Table Headers - Desktop only */}
        <div className="hidden lg:grid gap-8 bg-gray-50 p-4 border-b sticky top-0 z-10" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr' }}>
          <div className="font-medium text-gray-500">COMPANY</div>
          <div className="font-medium text-gray-500">DESCRIPTION</div>
          <div className="font-medium text-gray-500">FUNDING</div>
          <div className="font-medium text-gray-500">STATE</div>
          <div className="font-medium text-gray-500">EMPLOYEES</div>
          <div className="font-medium text-gray-500">ACTIONS</div>
        </div>

        {/* Scrollable Content Container */}
        <div className="max-h-[600px] overflow-y-auto">
          {filteredCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 lg:h-full text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium">No companies to show</p>
              <p className="text-sm">All companies have been reviewed</p>
            </div>
          ) : (
            currentCompanies.map(company => (
              <div 
                key={company.id} 
                className={`p-4 border-b hover:bg-gray-50 transition-colors duration-150 ${
                  selectedCompanies.includes(company.id) ? 'bg-green-50 hover:bg-green-100' : ''
                }`}
              >
                {/* Desktop Layout */}
                <div className="hidden lg:grid gap-3 items-center" style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr' }}>
                  <div className="pr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <CompanyLogo company={company} size="sm" />
                      <div className="font-medium text-gray-800 min-w-0 flex-1">{company.name}</div>
                    </div>
                    <a 
                      href={company.website_url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 hover:underline text-sm mt-1 inline-block"
                    >
                      Visit Website
                    </a>
                    <div className="text-gray-600 text-xs pr-4 line-clamp-7">
                      {formatIndustry(company.industry)}
                    </div>
                  </div>
                  
                  <div className="text-gray-600 text-sm pr-4 line-clamp-7">
                    {company.short_description}
                  </div>
                  
                  <div className="pr-4">
                    <div className="text-teal-500 text-sm font-medium">
                      {formatFundingStage(company.latest_funding_stage)}
                    </div>
                    <div className="font-medium text-gray-800 mt-1">
                      {company.total_funding_printed || 'N/A'}
                    </div>
                    <div className="text-gray-500 text-sm mt-1">
                      Founded {company.founded_year || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="pr-4">
                    <div className="text-gray-600 text-sm">{company.state || 'N/A'}</div>
                  </div>
                  
                  <div className="pr-4">
                    <div className="font-medium text-gray-800">
                      {formatEmployeeCount(company.estimated_num_employees)}
                    </div>
                  </div>
                  
                  <div>
                    {selectedCompanies.includes(company.id) ? (
                      <button 
                        className={`px-4 py-2 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 cursor-pointer text-sm font-medium ${
                          approveCompaniesMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => handleApproveCompany(company.id)}
                        disabled={approveCompaniesMutation.isPending}
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Approved
                      </button>
                    ) : (
                      <div>
                        <button 
                          className={`px-6 py-2 bg-blue-500 text-white rounded-md mb-2 w-full hover:bg-blue-600 ${
                            approveCompaniesMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleApproveCompany(company.id)}
                          disabled={approveCompaniesMutation.isPending}
                        >
                          Approve
                        </button>
                        <button 
                          className={`text-gray-400 hover:text-gray-600 text-sm ${
                            approveCompaniesMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleSkipCompany(company.id)}
                          disabled={approveCompaniesMutation.isPending}
                        >
                          Skip for now
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CompanyLogo company={company} size="md" />
                        <div className="font-medium text-gray-800 text-lg min-w-0 flex-1">{company.name}</div>
                      </div>
                      <a 
                        href={company.website_url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-500 hover:underline text-sm mt-1 inline-block"
                      >
                        Visit Website
                      </a>
                      <div className="text-gray-600 text-xs mt-1">
                        {formatIndustry(company.industry)}
                      </div>
                    </div>
                    <div>
                      {selectedCompanies.includes(company.id) ? (
                        <button 
                          className={`px-3 py-1.5 bg-green-500 text-white rounded-md flex items-center hover:bg-green-600 text-sm font-medium ${
                            approveCompaniesMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => handleApproveCompany(company.id)}
                          disabled={approveCompaniesMutation.isPending}
                        >
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Approved
                        </button>
                      ) : (
                        <div className="space-y-1">
                          <button 
                            className={`px-4 py-1.5 bg-blue-500 text-white rounded-md w-full hover:bg-blue-600 text-sm ${
                              approveCompaniesMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => handleApproveCompany(company.id)}
                            disabled={approveCompaniesMutation.isPending}
                          >
                            Approve
                          </button>
                          <button 
                            className={`text-gray-400 hover:text-gray-600 text-xs ${
                              approveCompaniesMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={() => handleSkipCompany(company.id)}
                            disabled={approveCompaniesMutation.isPending}
                          >
                            Skip for now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-gray-600 text-sm">
                    {company.short_description}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 font-medium">Funding</div>
                      <div className="text-teal-500 text-sm font-medium">
                        {formatFundingStage(company.latest_funding_stage)}
                      </div>
                      <div className="text-gray-800">
                        {company.total_funding_printed || 'N/A'}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Founded {company.founded_year || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 font-medium">Details</div>
                      <div className="text-gray-600">{company.state || 'N/A'}</div>
                      <div className="text-gray-800">
                        {formatEmployeeCount(company.estimated_num_employees)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Section with Submit Button and Pagination */}
      <div className="bg-white border-gray-200 px-4 py-4 sm:px-6">
        {/* Mobile Layout */}
        <div className="lg:hidden space-y-4">
          {/* Submit Button - Mobile */}
          <div className="flex flex-col items-center">
            <button
              className={`px-8 py-3 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 disabled:opacity-50 flex items-center justify-center w-[200px] ${
                approveCompaniesMutation.isPending ? 'cursor-not-allowed' : ''
              }`}
              onClick={openModal}
              disabled={selectedCompanies.length !== MAX_SELECTIONS || approveCompaniesMutation.isPending}
              title={selectedCompanies.length !== MAX_SELECTIONS ? `Please select ${MAX_SELECTIONS} companies (${MAX_SELECTIONS - selectedCompanies.length} more needed)` : ''}
            >
              {approveCompaniesMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Selections'
              )}
            </button>
            <div className={`mt-2 text-sm text-center ${selectedCompanies.length === MAX_SELECTIONS ? 'text-green-600' : 'text-gray-500'}`}>
              {selectedCompanies.length === MAX_SELECTIONS ? (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Ready to submit!
                </div>
              ) : selectedCompanies.length < MAX_SELECTIONS ? (
                `Select ${MAX_SELECTIONS - selectedCompanies.length} more ${MAX_SELECTIONS - selectedCompanies.length === 1 ? 'company' : 'companies'}`
              ) : (
                'Too many selections!'
              )}
            </div>
          </div>
          
          {/* Info and Pagination - Mobile */}
          <div className="flex justify-between items-center">
            <div className="text-gray-500 text-sm">
              {filteredCompanies.length > 0 ? (
                `Showing ${indexOfFirstCompany + 1} to ${Math.min(indexOfLastCompany, filteredCompanies.length)} of ${filteredCompanies.length} companies`
              ) : (
                'No more companies to show'
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex-shrink-0">
                {renderPaginationButtons()}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          {/* Left - Showing Info */}
          <div className="text-gray-500 text-sm min-w-0 flex-1">
            {filteredCompanies.length > 0 ? (
              `Showing ${indexOfFirstCompany + 1} to ${Math.min(indexOfLastCompany, filteredCompanies.length)} of ${filteredCompanies.length} companies`
            ) : (
              'No more companies to show'
            )}
          </div>
          
          {/* Center - Submit Button */}
          <div className="flex flex-col items-center px-8">
            <button
              className={`px-8 py-3 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 disabled:opacity-50 flex items-center justify-center w-[200px] ${
                approveCompaniesMutation.isPending ? 'cursor-not-allowed' : ''
              }`}
              onClick={openModal}
              disabled={selectedCompanies.length !== MAX_SELECTIONS || approveCompaniesMutation.isPending}
              title={selectedCompanies.length !== MAX_SELECTIONS ? `Please select ${MAX_SELECTIONS} companies (${MAX_SELECTIONS - selectedCompanies.length} more needed)` : ''}
            >
              {approveCompaniesMutation.isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Selections'
              )}
            </button>
            <div className={`mt-2 text-sm text-center ${selectedCompanies.length === MAX_SELECTIONS ? 'text-green-600' : 'text-gray-500'}`}>
              {selectedCompanies.length === MAX_SELECTIONS ? (
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Ready to submit!
                </div>
              ) : selectedCompanies.length < MAX_SELECTIONS ? (
                `Select ${MAX_SELECTIONS - selectedCompanies.length} more ${MAX_SELECTIONS - selectedCompanies.length === 1 ? 'company' : 'companies'}`
              ) : (
                'Too many selections!'
              )}
            </div>
          </div>
          
          {/* Right - Pagination */}
          <div className="min-w-0 flex-1 flex justify-end">
            {totalPages > 1 && (
              <div className="flex-shrink-0">
                {renderPaginationButtons()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10"
        showCloseButton={false}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="font-semibold text-gray-800 text-title-sm dark:text-white/90">
            Submit Company Selections
          </h4>
        </div>
        
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
          Are you sure you want to submit your selections? You have selected {selectedCompanies.length} companies. 
          This action cannot be undone.
        </p>

        <div className="flex items-center justify-end w-full gap-3 mt-8">
          <Button size="sm" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSubmitSelections}
            disabled={approveCompaniesMutation.isPending}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white"
          >
            {approveCompaniesMutation.isPending ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </Modal>
    </div>
  );
} 