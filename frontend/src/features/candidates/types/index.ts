export interface FileStatus {
  filename: string | null;
  found: boolean;
  source: 'local' | 'ashby' | 'fathom' | null;
}

export interface ResumeFileStatus extends FileStatus {
  resume_file_handle: string | null;
  source: 'local' | 'ashby' | null;
}

export interface TranscriptFileStatus extends FileStatus {
  transcript_id: number;
  source: 'local' | 'fathom' | null;
}

export interface CandidateFormData {
  first_name: string;
  last_name: string;
  email: string;
  linkedin_url: string;
  resume_file: File | null;
  call_transcript_file: File | null;
  additional_info: string;
}

export interface CandidateData extends CandidateFormData {
  id?: number;
  processing_status?: string;
  resume_filename?: string;
  resume_source?: string;
  resume_handle_id?: string;
  call_transcript_filename?: string;
  call_transcript_source?: string;
  call_transcript_id?: number;
}

export interface AshbyResumeResponse {
  filename: string;
  resume_file_handle: string;
}

export interface FathomTranscriptResponse {
  transcript: string;
  call_transcript_title: string;
  call_transcript_id: number;
}

export interface ValidationError {
  message: string;
}

export type ProcessingStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'; 