// Type for company preferences generated from candidate analysis
export type CompanyPreferences = {
    locations: string[];
    categories: string[];
    funding_stage: string[];
};

// Type for the extracted candidate data used in PDF templates
export type CandidateExtractedData = {
    candidate_first_name?: string;
    candidate_last_name?: string;
    target_role?: string;
    base_salary_min?: number;
    base_salary_max?: number;
    location_preference?: Array<{
        work_arrangement: string;
        locations: string[];
    }>;
    qualifications?: Record<string, string[]>;
    core_competencies?: string[];
    unique_attributes?: string[];
    proudest_achievement?: string;
    career_goals?: string[];
    availability?: string;
};

export type Candidate = {
    id: number;
    role: string;
    first_name: string;
    last_name: string;
    email: string;
    linkedin_url: string;
    processing_status: ProcessingStatus;
    extracted_data?: CandidateExtractedData;
    additional_info: string;
    resume_source: string;
    resume_handle_id: number;
    resume_filename: string;
    call_transcript_source: string;
    call_transcript_id: number;
    call_transcript_filename: string;
    company_preferences?: CompanyPreferences;
}

// Processing Status Constants
export const PROCESSING_STATUS = {
    NOT_STARTED: "not_started",
    EXTRACTING_CANDIDATE_DATA: "extracting_candidate_data",
    CANDIDATE_DATA_EXTRACTED: "candidate_data_extracted",
    SEARCHING_COMPANIES: "searching_companies",
    COMPANIES_MATCHED: "companies_matched",
    NO_COMPANIES_MATCHED: "no_companies_matched",
    CANDIDATE_APPROVAL_PENDING: "candidate_approval_pending",
    CANDIDATE_APPROVED: "candidate_approved",
    FINDING_DECISION_MAKERS: "finding_decision_makers",
    DECISION_MAKERS_FOUND: "decision_makers_found",
    NO_DECISION_MAKERS_FOUND: "no_decision_makers_found",
    CAMPAIGN_CREATING: "campaign_creating",
    CAMPAIGN_CREATED: "campaign_created",
    FAILED: "failed"
} as const;

export type ProcessingStatus = typeof PROCESSING_STATUS[keyof typeof PROCESSING_STATUS];