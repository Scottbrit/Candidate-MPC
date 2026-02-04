export const validateDomain = (domain: string): boolean => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain.trim());
};

export const validateDomains = (domains: string[]): string | undefined => {
  if (domains.length === 0) {
    return 'At least one company domain is required';
  }

  const invalidDomains = domains.filter(domain => !validateDomain(domain));
  if (invalidDomains.length > 0) {
    return `Invalid domain format: ${invalidDomains.join(', ')}`;
  }

  return undefined;
};

export const parseDomainInput = (input: string): string[] => {
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

export const formatDomainsForDisplay = (domains: string[]): string => {
  return domains.join('\n');
}; 