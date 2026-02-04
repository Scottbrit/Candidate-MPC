import { useState, useEffect } from 'react';
import { useFathomTranscriptSearch } from '../api/fathom-service';
import { isEmail } from '../utils/validation';
import type { TranscriptFileStatus, FathomTranscriptResponse } from '../types';

interface UseFathomTranscriptProps {
  initialEmail?: string;
  initialTranscriptFilename?: string;
  initialTranscriptSource?: string;
  initialTranscriptId?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useFathomTranscript = ({
  initialEmail,
  initialTranscriptFilename,
  initialTranscriptSource,
  initialTranscriptId,
  onSuccess,
  onError,
}: UseFathomTranscriptProps = {}) => {
  const [transcriptFileStatus, setTranscriptFileStatus] = useState<TranscriptFileStatus>({
    filename: null,
    transcript_id: 0,
    found: false,
    source: 'local',
  });

  const [currentEmail, setCurrentEmail] = useState(initialEmail || '');
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [isFileChanged, setIsFileChanged] = useState(false);

  const fathomMutation = useFathomTranscriptSearch({
    onSuccess: (data: FathomTranscriptResponse) => {
      if (data.transcript) {
        setTranscriptFileStatus({
          filename: data.call_transcript_title,
          transcript_id: data.call_transcript_id,
          source: 'fathom',
          found: true,
        });
        onSuccess?.();
      }
    },
    onError: (error: Error) => {
      console.error('Error getting transcript:', error);
      onError?.(error);
    },
  });

  // Initialize state from props if available
  useEffect(() => {
    if (initialEmail && initialTranscriptFilename && initialTranscriptSource) {
      setButtonDisabled(false);
      setCurrentEmail(initialEmail);
      setTranscriptFileStatus({
        filename: initialTranscriptFilename,
        transcript_id: initialTranscriptId || 0,
        source: initialTranscriptSource as 'local' | 'fathom',
        found: true,
      });
    }
  }, [initialEmail, initialTranscriptFilename, initialTranscriptSource, initialTranscriptId]);

  const handleEmailChange = (email: string) => {
    setCurrentEmail(email);
    
    // Reset fathom status when email changes
    if (transcriptFileStatus.source === 'fathom') {
      setTranscriptFileStatus({
        filename: null,
        transcript_id: 0,
        source: null,
        found: false,
      });
    }
    
    setButtonDisabled(!isEmail(email));
  };

  const handleClickButton = async () => {
    setIsFileChanged(true);
    
    if (isEmail(currentEmail) && transcriptFileStatus.source !== 'fathom') {
      // Search for transcript on Fathom
      fathomMutation.mutate(currentEmail);
    } else if (transcriptFileStatus.source === 'fathom' && transcriptFileStatus.found && transcriptFileStatus.transcript_id) {
      // Open Fathom external link
      window.open(
        `https://fathom.com/call-transcripts/${transcriptFileStatus.transcript_id}`,
        '_blank'
      );
    }
  };

  const handleTranscriptFileChange = (file: File | null) => {
    setIsFileChanged(true);
    setTranscriptFileStatus({
      filename: file?.name || null,
      transcript_id: 0,
      source: 'local',
      found: !!file,
    });
  };

  const getButtonContent = () => {
    if (fathomMutation.isPending) return 'Checking...';
    if (transcriptFileStatus.found && transcriptFileStatus.source === 'fathom' && transcriptFileStatus.transcript_id) {
      return 'Go to Transcript';
    }
    return 'Find on Fathom';
  };

  const getButtonColor = () => {
    return transcriptFileStatus.transcript_id ? 'bg-green-600 hover:bg-red-300' : undefined;
  };

  const getTooltipContent = () => {
    return buttonDisabled ? 'Enter an email first to search transcript on Fathom' : undefined;
  };

  return {
    transcriptFileStatus,
    setTranscriptFileStatus,
    currentEmail,
    setCurrentEmail,
    handleEmailChange,
    handleClickButton,
    buttonDisabled: buttonDisabled || fathomMutation.isPending,
    isLoading: fathomMutation.isPending,
    handleTranscriptFileChange,
    isFileChanged,
    buttonContent: getButtonContent(),
    buttonColor: getButtonColor(),
    tooltipContent: getTooltipContent(),
  };
}; 