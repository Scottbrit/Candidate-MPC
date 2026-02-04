import { useState } from 'react';
import { GenericDataTable } from "@/components/tables/DataTables/TableThree/GenericDataTable";
import type { TableConfig } from "@/components/tables/DataTables/TableThree/GenericDataTable";
import { useCompanySelections } from '../api/get-company-selections';
import type { CompanySelection } from '../api/get-company-selections';
import Avatar from '@/components/ui/avatar/Avatar';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { CopyIcon } from '@/components/ui/icons';

interface CandidateCompanySelectionsTableProps {
  candidateId: string;
}

// Transform the nested data structure to a flat one for the table
type FlattenedCompanySelection = {
  id: number;
  company_name: string;
  industry: string;
  location: string;
  funding_stage: string;
  employees: number;
  approved_by_candidate: boolean;
  logo_url?: string;
  website_url?: string;
  decision_makers: Array<{
    email?: string;
    title: string;
    last_name: string;
    first_name: string;
    linkedin_url?: string;
    photo_url?: string;
  }>;
  original_data: CompanySelection;
};

const CompanyLogo = ({ company }: { company: FlattenedCompanySelection }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
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
      <div className={`w-8 h-8 ${getBackgroundColor(company.company_name)} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <span className="text-sm font-semibold text-white">
          {getInitials(company.company_name)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 flex-shrink-0 relative">
      {imageLoading && (
        <div className={`w-8 h-8 ${getBackgroundColor(company.company_name)} rounded-lg flex items-center justify-center absolute inset-0`}>
          <span className="text-sm font-semibold text-white">
            {getInitials(company.company_name)}
          </span>
        </div>
      )}
      <img 
        src={company.logo_url} 
        alt={`${company.company_name} logo`}
        className={`w-8 h-8 object-contain rounded-lg ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
};

const ApprovalStatusBadge = ({ approved }: { approved: boolean }) => (
  <span className={`
    inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
    ${approved 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  `}>
    {approved ? (
      <>
        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Approved
      </>
    ) : (
      'Not Selected'
    )}
  </span>
);

const DecisionMakersModal = ({ 
  isOpen, 
  onClose, 
  decisionMakers, 
  companyName 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  decisionMakers: FlattenedCompanySelection['decision_makers']; 
  companyName: string;
}) => {
  const copyToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
  <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Decision Makers at {companyName}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {decisionMakers.length} decision makers found
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {decisionMakers.map((dm, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-start space-x-3">
              {dm.photo_url ? (
                <Avatar 
                  src={dm.photo_url} 
                  alt={`${dm.first_name} ${dm.last_name}`}
                  size="medium"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {dm.first_name.charAt(0)}{dm.last_name.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate" title={`${dm.first_name} ${dm.last_name}`}>
                  {dm.first_name} {dm.last_name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate" title={dm.title}>
                  {dm.title}
                </p>
                
                <div className="flex items-center space-x-3 mt-3">
                  {dm.email && (
                    <button 
                      onClick={() => copyToClipboard(dm.email!)}
                      className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
                    >
                      <CopyIcon className="w-3 h-3 mr-1" />
                      Copy Email
                    </button>
                  )}
                  {dm.linkedin_url && (
                    <a 
                      href={dm.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
                    >
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button onClick={onClose} variant="outline" size="sm">
          Close
        </Button>
      </div>
    </div>
  </Modal>
  );
};

const DecisionMakersCompact = ({ decisionMakers, companyName }: { 
  decisionMakers: FlattenedCompanySelection['decision_makers']; 
  companyName: string; 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  if (decisionMakers.length === 0) {
    return (
      <span className="text-gray-500 dark:text-gray-400 text-sm">
        No decision makers
      </span>
    );
  }

  const visibleDMs = decisionMakers.slice(0, 3);
  const remainingCount = decisionMakers.length - 2;

  return (
    <>
      {/* Clickable Avatar stack */}
      <div 
        className="flex -space-x-2 cursor-pointer hover:scale-105 transition-transform duration-200" 
        onClick={() => setIsModalOpen(true)}
        title={`View ${decisionMakers.length} decision maker${decisionMakers.length === 1 ? '' : 's'}`}
      >
        {visibleDMs.map((dm, index) => (
          <div key={index} className="relative">
            {dm.photo_url ? (
              <Avatar 
                src={dm.photo_url} 
                alt={`${dm.first_name} ${dm.last_name}`}
                size="small"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {dm.first_name.charAt(0)}{dm.last_name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>

      <DecisionMakersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        decisionMakers={decisionMakers}
        companyName={companyName}
      />
    </>
  );
};

const tableConfig: TableConfig<FlattenedCompanySelection> = {
  // Custom search function for complex data structure
  searchFields: ['company_name', 'industry', 'location', 'funding_stage'],
  columns: [
    {
      key: "company_info",
      label: "Company",
      type: "action",
      sortable: true,
      getSortValue: (item) => item.company_name.toLowerCase(),
      renderAction: (item) => (
        <div className="flex items-center space-x-3 min-w-0">
          <CompanyLogo company={item} />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {item.company_name}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {item.industry}
            </div>
            {item.website_url && (
              <a
                href={item.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      type: "string",
      sortable: true,
    },
    {
      key: "funding_stage",
      label: "Funding Stage",
      type: "string",
      sortable: true,
      formatValue: (item) => {
        const company = item as FlattenedCompanySelection;
        return company.funding_stage && company.funding_stage !== 'N/A' ? company.funding_stage : 'N/A';
      },
    },
    {
      key: "employees",
      label: "Employees",
      type: "number",
      sortable: true,
      formatValue: (item) => {
        const company = item as FlattenedCompanySelection;
        return company.employees > 0 ? company.employees.toString() : 'N/A';
      },
    },
    {
      key: "approved_by_candidate",
      label: "Status",
      type: "action",
      sortable: true,
      getSortValue: (item) => item.approved_by_candidate ? 1 : 0,
      renderAction: (item) => (
        <ApprovalStatusBadge approved={item.approved_by_candidate} />
      ),
    },
    {
      key: "decision_makers",
      label: "Decision Makers",
      type: "action",
      sortable: false,
      renderAction: (item) => (
        <div className="min-w-0">
          <DecisionMakersCompact 
            decisionMakers={item.decision_makers} 
            companyName={item.company_name} 
          />
        </div>
      ),
    },
  ],
  itemsPerPageOptions: [5, 10, 20],
  defaultItemsPerPage: 10,
};

export const CandidateCompanySelectionsTable = ({ candidateId }: CandidateCompanySelectionsTableProps) => {
  const companySelectionsQuery = useCompanySelections({ 
    candidateId: Number(candidateId),
    queryConfig: {
      refetchInterval: 30 * 1000, // 30 seconds
    },
  });

  // Transform the nested data structure to a flat one for the table
  const flattenedData: FlattenedCompanySelection[] = 
    companySelectionsQuery.data?.data.map((selection) => {
      const company = selection.companies_apollo;
      return {
        id: company.id,
        company_name: company.name,
        industry: company.industry || 'N/A',
        location: `${company.city || ''}${company.city && company.state ? ', ' : ''}${company.state || ''}`.trim() || 'N/A',
        funding_stage: company.latest_funding_stage || 'N/A',
        employees: company.estimated_num_employees || 0,
        approved_by_candidate: selection.approved_by_candidate,
        logo_url: company.logo_url,
        website_url: company.website_url,
        decision_makers: company.company_decision_makers_apollo || [],
        original_data: selection,
      };
    }) || [];

  if (companySelectionsQuery.isLoading) {
    return (
      <div className="w-full p-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (companySelectionsQuery.isError) {
    return (
      <div className="w-full p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">
            Error loading company selections
          </p>
        </div>
      </div>
    );
  }

  const handleAction = async (action: string, item: FlattenedCompanySelection) => {
    console.log("Action:", action, item);
  };

  return (
    <div className="w-full p-4">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Company Selections & Matching
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Companies matched with the candidate and their selection status
          </p>
        </div>

        {flattenedData.length > 0 ? (
          <div className="overflow-x-auto">
            <GenericDataTable<FlattenedCompanySelection>
              data={flattenedData}
              config={tableConfig}
              onAction={handleAction}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m0 0H7m9 0v-7a2 2 0 00-2-2H9a2 2 0 00-2 2v7m9 0v-7a2 2 0 00-2-2H9a2 2 0 00-2 2v7" />
            </svg>
            <p className="text-lg font-medium">No company selections found</p>
            <p className="text-sm mt-1">
              Companies will appear here after matching is completed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 