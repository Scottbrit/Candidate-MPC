export const isNotEmpty = (value: string | null | undefined): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

export const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const isLinkedInUrl = (url: string): boolean => {
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
  return linkedinRegex.test(url);
};

export const isFileEmpty = (file: File | null | undefined): boolean => {
  return file?.size === 0;
};

export const validateCandidateForm = (data: {
  first_name: string;
  last_name: string;
  email: string;
  linkedin_url: string;
  resume_file: File | null;
  call_transcript_file: File | null;
}, resumeSource: string | null, transcriptSource: string | null, isUpdate = false) => {
  const errors: Record<string, string | null> = {
    first_name: null,
    last_name: null,
    email: null,
    linkedin_url: null,
    resume_file: null,
    call_transcript_file: null,
  };

  if (!isNotEmpty(data.first_name)) {
    errors.first_name = "First name is required";
  }

  if (!isNotEmpty(data.last_name)) {
    errors.last_name = "Last name is required";
  }

  if (!isNotEmpty(data.email)) {
    errors.email = "Email is required";
  } else if (!isEmail(data.email)) {
    errors.email = "Invalid email address";
  }

  if (!isNotEmpty(data.linkedin_url)) {
    errors.linkedin_url = "LinkedIn URL is required";
  } else if (!isLinkedInUrl(data.linkedin_url)) {
    errors.linkedin_url = "Invalid LinkedIn URL";
  }

  // Resume validation logic
  if (isFileEmpty(data.resume_file)) {
    if (resumeSource === 'local') {
      if (!isUpdate) {
        errors.resume_file = "Resume file is required";
      }
    } else if (resumeSource === null) {
      errors.resume_file = "Resume file is required";
    }
  }

  // Transcript validation logic
  if (isFileEmpty(data.call_transcript_file)) {
    if (transcriptSource === 'local') {
      if (!isUpdate) {
        errors.call_transcript_file = "Call transcript file is required";
      }
    } else if (transcriptSource === null) {
      errors.call_transcript_file = "Call transcript file is required";
    }
  }

  return errors;
}; 