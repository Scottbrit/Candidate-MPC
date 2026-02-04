import Label from '@/components/form/Label';
import type { CompanySearchStrategyProps, StrategyOption, SearchStrategy } from './types';
import { DomainTagInput } from './domain-tag-input';

export const CompanySearchStrategy: React.FC<CompanySearchStrategyProps> = ({
  value,
  onChange,
  error,
  disabled = false,
}) => {
  // Strategy options configuration
  const strategyOptions: StrategyOption[] = [
    {
      value: 'default',
      title: 'Smart Search',
      description: 'Automatically find companies based on candidate profile',
      showDomainInput: false,
      icon: (
        <svg className="h-6 w-6 fill-white" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      value: 'hybrid',
      title: 'Priority + Smart',
      description: 'Include specific companies plus smart matching',
      showDomainInput: true,
      icon: (
        <svg className="h-6 w-6 fill-white" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      value: 'manual',
      title: 'Specific Only',
      description: 'Search only in manually provided companies',
      showDomainInput: true,
      icon: (
        <svg className="h-6 w-6 fill-white" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h2M7 3v18M15 3v18" />
        </svg>
      ),
    },
  ];

  const selectedOption = strategyOptions.find(option => option.value === value.strategy);
  const shouldShowDomainInput = selectedOption?.showDomainInput || false;

  // Handle strategy selection
  const handleStrategyChange = (strategy: SearchStrategy) => {
    onChange({
      strategy,
      domains: strategy === 'default' ? [] : value.domains,
    });
  };

  // Handle domain changes
  const handleDomainsChange = (domains: string[]) => {
    onChange({
      ...value,
      domains,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>
          Company Search Strategy
          <span className="text-red-500 ml-1">*</span>
        </Label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose how to find relevant companies for this candidate
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {strategyOptions.map((option) => (
          <div
            key={option.value}
            className={`
              relative cursor-pointer rounded-lg border p-4 transition-all duration-200
              ${value.strategy === option.value
                ? 'border-brand-300 bg-brand-25 ring-2 ring-brand-500/20 dark:border-brand-700 dark:bg-brand-900/20'
                : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
            `}
            onClick={() => !disabled && handleStrategyChange(option.value)}
          >
            {/* Selection Indicator */}
            <div className="absolute top-3 right-3">
              <div
                className={`
                  h-4 w-4 rounded-full border-2 transition-colors
                  ${value.strategy === option.value
                    ? 'border-brand-500 bg-brand-500'
                    : 'border-gray-300 dark:border-gray-600'
                  }
                `}
              >
                {value.strategy === option.value && (
                  <div className="h-full w-full rounded-full bg-white scale-50" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="pr-6">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`
                    p-2 rounded-lg
                    ${value.strategy === option.value
                      ? 'text-brand-600 bg-brand-100 dark:text-brand-400 dark:bg-brand-900/40'
                      : 'text-gray-600 bg-brand-100 dark:text-gray-400 dark:bg-gray-800'
                    }
                  `}
                >
                  {option.icon}
                </div>
                <h3
                  className={`
                    font-semibold text-sm
                    ${value.strategy === option.value
                      ? 'text-brand-600 dark:text-brand-100'
                      : 'text-gray-900 dark:text-gray-100'
                    }
                  `}
                >
                  {option.title}
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-4">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Conditional Domain Input */}
      {shouldShowDomainInput && (
        <div className="space-y-3">
          <div>
            <Label>
              Company Domains
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Type company domains and press Enter to add them. Example: google.com
            </p>
          </div>
          
          <DomainTagInput
            domains={value.domains}
            onChange={handleDomainsChange}
            placeholder="Type domain and press Enter... (e.g., google.com)"
            disabled={disabled}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}; 