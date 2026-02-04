import { PROCESSING_STATUS, type ProcessingStatus } from '@/types/api';

/**
 * Get human-readable text for processing status
 */
export const getStatusText = (status: ProcessingStatus): string => {
    switch (status) {
        case PROCESSING_STATUS.NOT_STARTED:
            return "Process Not Started";
        case PROCESSING_STATUS.EXTRACTING_CANDIDATE_DATA:
            return "Processing Resume & Transcript";
        case PROCESSING_STATUS.CANDIDATE_DATA_EXTRACTED:
            return "Resume & Transcript Processed";
        case PROCESSING_STATUS.SEARCHING_COMPANIES:
            return "Finding Matching Companies";
        case PROCESSING_STATUS.COMPANIES_MATCHED:
            return "Compatible Companies Found";
        case PROCESSING_STATUS.NO_COMPANIES_MATCHED:
            return "No Compatible Companies Found";
        case PROCESSING_STATUS.CANDIDATE_APPROVAL_PENDING:
            return "Waiting for Candidate's Company Selection";
        case PROCESSING_STATUS.CANDIDATE_APPROVED:
            return "Companies Selected by Candidate";
        case PROCESSING_STATUS.FINDING_DECISION_MAKERS:
            return "Finding Decision Makers";
        case PROCESSING_STATUS.DECISION_MAKERS_FOUND:
            return "Decision Makers Found";
        case PROCESSING_STATUS.NO_DECISION_MAKERS_FOUND:
            return "No Decision Makers Found";
        case PROCESSING_STATUS.FAILED:
            return "Process Failed";
        case PROCESSING_STATUS.CAMPAIGN_CREATING:
            return "Campaign Creating";
        case PROCESSING_STATUS.CAMPAIGN_CREATED:
            return "Campaign Created";
        default:
            return "Processing";
    }
};

/**
 * Get CSS classes for status badge styling
 */
export const getStatusClass = (status: ProcessingStatus): string => {
    switch (status) {
        case PROCESSING_STATUS.NOT_STARTED:
            return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
        case PROCESSING_STATUS.EXTRACTING_CANDIDATE_DATA:
            return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300";
        case PROCESSING_STATUS.CANDIDATE_DATA_EXTRACTED:
            return "bg-sky-100 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300";
        case PROCESSING_STATUS.SEARCHING_COMPANIES:
            return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
        case PROCESSING_STATUS.COMPANIES_MATCHED:
            return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
        case PROCESSING_STATUS.NO_COMPANIES_MATCHED:
            return "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
        case PROCESSING_STATUS.CANDIDATE_APPROVAL_PENDING:
            return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300";
        case PROCESSING_STATUS.CANDIDATE_APPROVED:
            return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
        case PROCESSING_STATUS.FINDING_DECISION_MAKERS:
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
        case PROCESSING_STATUS.DECISION_MAKERS_FOUND:
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
        case PROCESSING_STATUS.NO_DECISION_MAKERS_FOUND:
            return "bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300";
        case PROCESSING_STATUS.FAILED:
            return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
        case PROCESSING_STATUS.CAMPAIGN_CREATING:
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
        case PROCESSING_STATUS.CAMPAIGN_CREATED:
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
        default:
            return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
    }
};

/**
 * Check if resume is ready for download
 */
export const isResumeReady = (status: ProcessingStatus): boolean => {
    switch (status) {
        case PROCESSING_STATUS.CANDIDATE_DATA_EXTRACTED:
        case PROCESSING_STATUS.SEARCHING_COMPANIES:
        case PROCESSING_STATUS.COMPANIES_MATCHED:
        case PROCESSING_STATUS.CANDIDATE_APPROVAL_PENDING:
        case PROCESSING_STATUS.CANDIDATE_APPROVED:
        case PROCESSING_STATUS.FINDING_DECISION_MAKERS:
        case PROCESSING_STATUS.DECISION_MAKERS_FOUND:
        case PROCESSING_STATUS.CAMPAIGN_CREATED:
        case PROCESSING_STATUS.CAMPAIGN_CREATING:
        case PROCESSING_STATUS.NO_DECISION_MAKERS_FOUND:
            return true;
        default:
            return false;
    }
};

/**
 * Check if magic link can be sent to candidate
 */
export const canSendMagicLink = (status: ProcessingStatus): boolean => {
    return status === PROCESSING_STATUS.COMPANIES_MATCHED;
};

/**
 * Check if candidate details can be viewed
 */
export const canViewDetails = (status: ProcessingStatus): boolean => {
    switch (status) {
        case PROCESSING_STATUS.CANDIDATE_DATA_EXTRACTED:
        case PROCESSING_STATUS.SEARCHING_COMPANIES:
        case PROCESSING_STATUS.COMPANIES_MATCHED:
        case PROCESSING_STATUS.NO_COMPANIES_MATCHED:
        case PROCESSING_STATUS.CANDIDATE_APPROVAL_PENDING:
        case PROCESSING_STATUS.CANDIDATE_APPROVED:
        case PROCESSING_STATUS.FINDING_DECISION_MAKERS:
        case PROCESSING_STATUS.DECISION_MAKERS_FOUND:
        case PROCESSING_STATUS.CAMPAIGN_CREATED:
        case PROCESSING_STATUS.CAMPAIGN_CREATING:
        case PROCESSING_STATUS.NO_DECISION_MAKERS_FOUND:
            return true;
        default:
            return false;
    }
};

/**
 * Check if campaign can be created for candidate
 */
export const canCreateCampaign = (status: ProcessingStatus): boolean => {
    return status === PROCESSING_STATUS.DECISION_MAKERS_FOUND;
};

/**
 * Check if the process is currently running (in progress)
 */
export const isProcessing = (status: ProcessingStatus): boolean => {
    switch (status) {
        case PROCESSING_STATUS.EXTRACTING_CANDIDATE_DATA:
        case PROCESSING_STATUS.SEARCHING_COMPANIES:
        case PROCESSING_STATUS.FINDING_DECISION_MAKERS:
        case PROCESSING_STATUS.CAMPAIGN_CREATING:
            return true;
        default:
            return false;
    }
};

/**
 * Get tooltip message for disabled actions
 */
export const getActionTooltip = (action: 'resume' | 'email' | 'view' | 'campaign', status: ProcessingStatus): string => {
    switch (action) {
        case 'resume':
            if (!isResumeReady(status)) {
                return "Resume will be available after candidate data is processed";
            }
            return "Download blinded resume";
            
        case 'email':
            if (!canSendMagicLink(status)) {
                return "Magic link can only be sent after companies are matched";
            }
            return "Send magic link to candidate";
            
        case 'view':
            if (!canViewDetails(status)) {
                return "Details will be available after candidate data is processed";
            }
            return "View candidate details";

        case 'campaign':
            if (!canCreateCampaign(status)) {
                return "Campaign can only be created after decision makers are found";
            }
            return "Create campaign for candidate";
            
        default:
            return "";
    }
}; 