import { useState, useEffect } from 'react';
import { useAshbyResumeSearch } from '../api/ashby-service';
import { isEmail } from '../utils/validation';
import type { ResumeFileStatus } from '../types';

interface UseAshbyResumeProps {
  initialEmail?: string;
  initialResumeFilename?: string;
  initialResumeSource?: string;
  initialResumeFileHandle?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAshbyResume = ({
  initialEmail,
  initialResumeFilename,
  initialResumeSource,
  initialResumeFileHandle,
  onSuccess,
  onError,
}: UseAshbyResumeProps = {}) => {
  const [resumeFileStatus, setResumeFileStatus] = useState<ResumeFileStatus>({
    filename: null,
    resume_file_handle: null,
    found: false,
    source: 'local',
  });

  const [currentEmail, setCurrentEmail] = useState(initialEmail || '');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [isFileChanged, setIsFileChanged] = useState(false);

  const ashbyMutation = useAshbyResumeSearch({
    onSuccess: (data) => {
      if (data.filename) {
        setResumeFileStatus({
          filename: data.filename,
          resume_file_handle: data.resume_file_handle,
          source: 'ashby',
          found: true,
        });
        onSuccess?.();
      }
    },
    onError: (error) => {
      console.error('Error getting resume:', error);
      onError?.(error);
    },
  });

  // Initialize state from props if available
  useEffect(() => {
    if (initialEmail && initialResumeFilename && initialResumeSource) {
      setButtonDisabled(false);
      setCurrentEmail(initialEmail);
      setResumeFileStatus({
        filename: initialResumeFilename,
        resume_file_handle: initialResumeFileHandle || null,
        source: initialResumeSource as 'local' | 'ashby',
        found: true,
      });
    }
  }, [initialEmail, initialResumeFilename, initialResumeSource, initialResumeFileHandle]);

  const handleEmailChange = (email: string) => {
    setCurrentEmail(email);
    
    // Reset ashby status when email changes
    if (resumeFileStatus.source === 'ashby') {
      setResumeFileStatus({
        filename: null,
        resume_file_handle: null,
        source: null,
        found: false,
      });
    }
    
    setButtonDisabled(!isEmail(email));
  };

  const handleClickButton = async () => {
    setIsFileChanged(true);
    
    if (isEmail(currentEmail) && resumeFileStatus.source !== 'ashby') {
      // Search for resume on Ashby
      ashbyMutation.mutate(currentEmail);
    } else if (resumeFileStatus.source === 'ashby' && resumeFileStatus.found && resumeFileStatus.resume_file_handle) {
      // Open Ashby external link
      window.open(
        `https://app.ashbyhq.com/people/${resumeFileStatus.resume_file_handle}`,
        '_blank'
      );
    }
  };

  const handleResumeFileChange = (file: File | null) => {
    setIsFileChanged(true);
    setResumeFileStatus({
      filename: file?.name || null,
      resume_file_handle: null,
      source: 'local',
      found: !!file,
    });

    return file;
  };

  const getButtonContent = () => {
    if (ashbyMutation.isPending) return 'Checking...';
    if (resumeFileStatus.found && resumeFileStatus.source === 'ashby' && resumeFileStatus.resume_file_handle) {
      return 'Go to Resume';
    }
    return 'Find on Ashby';
  };

  const getButtonColor = () => {
    return resumeFileStatus.resume_file_handle ? 'bg-green-600 hover:bg-red-300' : undefined;
  };

  const getTooltipContent = () => {
    return buttonDisabled ? 'Enter an email first to search resume on Ashby' : undefined;
  };

  return {
    resumeFileStatus,
    setResumeFileStatus,
    currentEmail,
    setCurrentEmail,
    handleEmailChange,
    handleClickButton,
    buttonDisabled: buttonDisabled || ashbyMutation.isPending,
    isLoading: ashbyMutation.isPending,
    handleResumeFileChange,
    isFileChanged,
    buttonContent: getButtonContent(),
    buttonColor: getButtonColor(),
    tooltipContent: getTooltipContent(),
  };
}; 