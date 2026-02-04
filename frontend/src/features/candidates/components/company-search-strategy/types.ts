export type SearchStrategy = 'default' | 'hybrid' | 'manual';

export interface CompanySearchConfig {
  strategy: SearchStrategy;
  domains: string[];
}

export interface CompanySearchStrategyProps {
  value: CompanySearchConfig;
  onChange: (config: CompanySearchConfig) => void;
  error?: string;
  disabled?: boolean;
}

export interface StrategyOption {
  value: SearchStrategy;
  title: string;
  description: string;
  icon: React.ReactNode;
  showDomainInput: boolean;
} 