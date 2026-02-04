import { useCandidate } from '../api/get-candidate';
import { canViewDetails } from '../utils/processing-status';

interface CandidateCompanyPreferencesProps {
  candidateId: string;
}

const TagBadge = ({ label, variant = 'default' }: { 
  label: string; 
  variant?: 'default' | 'location' | 'category' | 'funding'; 
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    location: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    category: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    funding: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  };

  return (
    <span className={`
      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
      ${variantClasses[variant]}
      transition-colors duration-200
    `}>
      {label}
    </span>
  );
};

const PreferenceSection = ({ 
  title, 
  items, 
  variant, 
  emptyText 
}: { 
  title: string;
  items: string[];
  variant: 'location' | 'category' | 'funding';
  emptyText: string;
}) => (
  <div className="space-y-3">
    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
      {title}
    </h4>
    {items.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <TagBadge 
            key={index} 
            label={item} 
            variant={variant}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
        <p className="text-sm">{emptyText}</p>
      </div>
    )}
  </div>
);

export const CandidateCompanyPreferences = ({ candidateId }: CandidateCompanyPreferencesProps) => {
  const candidateQuery = useCandidate({ candidateId: Number(candidateId) });
  const candidate = candidateQuery.data?.data;

  // Check if component should be visible based on processing status
  if (!candidate || !canViewDetails(candidate.processing_status)) {
    return null;
  }

  const preferences = candidate.company_preferences;

  // Don't render if no preferences data
  if (!preferences) {
    return null;
  }

  if (candidateQuery.isLoading) {
    return (
      <div className="w-full p-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (candidateQuery.isError) {
    return (
      <div className="w-full p-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">
            Error loading company preferences
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Company Preferences
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Preferences extracted from candidate analysis
          </p>
        </div>

        <div className="space-y-8">
          <PreferenceSection
            title="Preferred Locations"
            items={preferences.locations || []}
            variant="location"
            emptyText="No location preferences specified"
          />

          <PreferenceSection
            title="Industry Categories"
            items={preferences.categories || []}
            variant="category"
            emptyText="No industry preferences specified"
          />

          <PreferenceSection
            title="Funding Stages"
            items={preferences.funding_stage || []}
            variant="funding"
            emptyText="No funding stage preferences specified"
          />
        </div>
      </div>
    </div>
  );
}; 