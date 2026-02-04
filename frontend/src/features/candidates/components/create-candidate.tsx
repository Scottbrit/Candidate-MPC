import { useRef } from 'react';
import { useForm } from '@tanstack/react-form';
import { useNavigate } from 'react-router';

import Form from '@/components/form/Form';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/TextArea';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';
import { PaperPlaneIcon } from '@/components/ui/icons';
import { isNotEmpty, isFileEmpty, isEmail } from '../utils/validation';
import { EnhancedFileInput } from './enhanced-file-input';
import { CompanySearchStrategy } from './company-search-strategy';
import type { CompanySearchConfig } from './company-search-strategy/types';
import { validateDomains } from './company-search-strategy/utils';
import { paths } from '@/config/paths';

import { useAshbyResume } from '../hooks/use-ashby-resume';
import { useFathomTranscript } from '../hooks/use-fathom-transcript';
import { useCreateCandidate } from '../api/create-candidate';
import { toast } from 'react-toastify';

export const CreateCandidate = () => {
  const navigate = useNavigate();
  const resumeFileInputRef = useRef<HTMLInputElement>(null);
  const transcriptFileInputRef = useRef<HTMLInputElement>(null);

  const createCandidateMutation = useCreateCandidate({
    mutationConfig: {
      onSuccess: () => {
        navigate(paths.app.dashboard.getHref());
        toast.success('Candidate created successfully');
      },
      onError: (error) => {
        console.error('Error creating candidate:', error);
        toast.error(error.message);
      },
    },
  });

  // Loxo Resume Integration
  const {
    resumeFileStatus,
    handleEmailChange: handleAshbyEmailChange,
    handleClickButton: handleLoxoClick,
    buttonDisabled: isLoxoButtonDisabled,
    isLoading: loxoLoading,
    handleResumeFileChange,
    buttonContent: loxoButtonContent,
    buttonColor: loxoButtonColor,
    tooltipContent: loxoTooltip,
  } = useAshbyResume({
    onSuccess: () => {
        form.setFieldValue('resume_file', new File([], '', { type: ''}));
        form.validateAllFields('change');
        toast.success("Loxo resume found successfully");
    },
    onError: (error) => {
        console.error('Error getting resume from Loxo:', error);
        toast.error(`No resume found for the given email`);
    }
  });

  // Metaview Transcript Integration
  const {
    transcriptFileStatus,
    handleEmailChange: handleFathomEmailChange,
    handleClickButton: handleFathomClick,
    handleTranscriptFileChange,
    buttonContent: fathomButtonContent,
    buttonColor: fathomButtonColor,
    tooltipContent: fathomTooltip,
    buttonDisabled: isFathomButtonDisabled,
    isLoading: fathomLoading,
  } = useFathomTranscript({
    onSuccess: () => {
        form.setFieldValue('call_transcript_file', new File([], '', { type: ''}));
        form.validateAllFields('change');
        toast.success("Fathom transcript found successfully");
    },
    onError: (error) => {
        console.error('Error getting transcript from Fathom:', error);
        toast.error(`No transcript found for the given email`);
    }
  });

  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      linkedin_url: '',
      role: 'COS',
      resume_file: new File([], '', { type: ''}),
      call_transcript_file: new File([], '', { type: ''}),
      additional_info: '',
      company_search_config: {
        strategy: 'default' as const,
        domains: [],
      } as CompanySearchConfig,
    },
    onSubmit: async ({ value }) => {

        const formData = new FormData();

        formData.append('first_name', value.first_name);
        formData.append('last_name', value.last_name);
        formData.append('email', value.email);
        formData.append('linkedin_url', value.linkedin_url);
        formData.append('role', value.role);
        formData.append('additional_info', value.additional_info);
        formData.append('resume_file', value.resume_file);

        formData.append('resume_source', resumeFileStatus.source || '');
        formData.append('resume_filename', resumeFileStatus.filename || '');
        formData.append('ashby_email', value.email);

        formData.append('call_transcript_file', value.call_transcript_file);
        formData.append('call_transcript_source', transcriptFileStatus.source || '');
        formData.append('call_transcript_id', transcriptFileStatus.transcript_id.toString());
        formData.append('call_transcript_filename', transcriptFileStatus.filename || '');

        // Company search config
        formData.append('company_search_strategy', value.company_search_config.strategy);
        formData.append('company_domains', JSON.stringify(value.company_search_config.domains));

        // FormData içeriğini görüntülemek için
        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        console.log(resumeFileStatus)

        await createCandidateMutation.mutateAsync(formData);
    },
  });

  return (
    <div className="p-4">
        <Form onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
        }}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                    <form.Field 
                        name="first_name" 
                        validators={{ 
                            onChange: ({ value }) => 
                            !isNotEmpty(value) ? 'First name is required' : undefined }}
                    >
                        {(field) => (
                            <div>
                                <Label htmlFor="firstName">
                                    First Name
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Enter first name"
                                    id="firstName"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    error={!!field.state.meta.errors.length}
                                    hint={field.state.meta.errors.join(', ')}
                                />
                            </div>
                        )}
                    </form.Field>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <form.Field 
                        name="last_name" 
                        validators={{ 
                            onChange: ({ value }) => 
                            !isNotEmpty(value) ? 'Last name is required' : undefined }}
                    >
                        {(field) => (
                            <div>
                                <Label htmlFor="lastName">
                                    Last Name
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    type="text"
                                    placeholder="Enter last name"
                                    id="lastName"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    error={!!field.state.meta.errors.length}
                                    hint={field.state.meta.errors.join(', ')}
                                />
                            </div>
                        )}
                    </form.Field>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <form.Field 
                        name="email" 
                        validators={{ 
                            onChange: ({ value }) => 
                            !isNotEmpty(value) ? 'Email is required' : !isEmail(value) ? 'Invalid email address' : undefined 
                        }}
                        listeners={{
                            onChange: ({ value }) => {
                                handleAshbyEmailChange(value);
                                handleFathomEmailChange(value);
                            }
                        }}
                    >
                        {(field) => (
                            <div>
                                <Label htmlFor="email">
                                    Email
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    type="email"
                                    placeholder="Enter email"
                                    id="email"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    error={!!field.state.meta.errors.length}
                                    hint={field.state.meta.errors.join(', ')}
                                />
                            </div>
                        )}
                    </form.Field>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <form.Field 
                        name="linkedin_url" 
                        validators={{ 
                            onChange: ({ value }) => 
                            !isNotEmpty(value) ? 'LinkedIn URL is required' : undefined }}
                    >
                        {(field) => (
                            <div>
                                <Label htmlFor="linkedinUrl">
                                    LinkedIn URL
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Input
                                    type="url"
                                    placeholder="Enter LinkedIn URL"
                                    id="linkedinUrl"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    error={!!field.state.meta.errors.length}
                                    hint={field.state.meta.errors.join(', ')}
                                />
                            </div>
                        )}
                    </form.Field>
                </div>

                {/* Candidate Type Selection */}
                <div className="col-span-2">
                    <form.Field name="role">
                        {(field) => (
                            <div>
                                <Label htmlFor="candidateType">
                                    Role
                                    <span className="text-red-500 ml-1">*</span>
                                </Label>
                                <Select
                                    options={[
                                        { value: 'COS', label: 'CoS' },
                                        { value: 'ENGINEERING', label: 'Engineering' },
                                        { value: 'PRODUCT', label: 'Product' },
                                        { value: 'MARKETING', label: 'Marketing' },
                                        { value: 'REVENUE', label: 'Revenue' },
                                        { value: 'OPERATIONS', label: 'Operations' },
                                    ]}
                                    placeholder="Select candidate role"
                                    defaultValue={field.state.value}
                                    onChange={(value) => field.handleChange(value)}
                                />
                            </div>
                        )}
                    </form.Field>
                </div>

                {/* File Uploads */}
                <div className="col-span-2">
                    <form.Field
                    name="resume_file"
                    validators={{
                        onChange: ({ value }) => {
                        if (isFileEmpty(value) && resumeFileStatus.source === 'local') {
                            return 'Resume file is required';
                        }
                        if (isFileEmpty(value) && resumeFileStatus.source === null) {
                            return 'Resume file is required';
                        }

                        return undefined;
                        }
                    }}
                    >
                    {(field) => (
                        <EnhancedFileInput
                        label="Resume"
                        id="resume_file"
                        accept=".pdf"
                        required
                        error={field.state.meta.errors.length > 0 && resumeFileStatus.source !== 'ashby' 
                            ? field.state.meta.errors.join(', ') 
                            : null
                        }
                        filename={resumeFileStatus.filename}
                        buttonContent={loxoButtonContent}
                        onButtonClick={handleLoxoClick}
                        buttonDisabled={isLoxoButtonDisabled || loxoLoading}
                        buttonColor={loxoButtonColor}
                        onChange={(file) => {
                            field.handleChange(handleResumeFileChange(file) || new File([], '', { type: ''}));
                        }}
                        tooltipContent={loxoTooltip}
                        fileInputRef={resumeFileInputRef}
                        showExternalIcon={resumeFileStatus.resume_file_handle !== null}
                        />
                    )}
                    </form.Field>
                </div>

                <div className="col-span-2">
                    <form.Field
                    name="call_transcript_file"
                    validators={{
                        onChange: ({ value }) => {
                        if (isFileEmpty(value) && transcriptFileStatus.source === 'local') {
                            return 'Call transcript file is required';
                        }
                        if (isFileEmpty(value) && transcriptFileStatus.source === null) {
                            return 'Call transcript file is required';
                        }

                        return undefined;
                        }
                    }}
                    >
                    {(field) => (
                        <EnhancedFileInput
                        label="Call Transcript"
                        id="call_transcript_file"
                        accept=".pdf"
                        required
                        error={field.state.meta.errors.length > 0 && transcriptFileStatus.source !== 'fathom'
                            ? field.state.meta.errors.join(', ')
                            : null
                        }
                        filename={transcriptFileStatus.filename}
                        buttonContent={fathomButtonContent}
                        onButtonClick={handleFathomClick}
                        buttonDisabled={isFathomButtonDisabled || fathomLoading}
                        buttonColor={fathomButtonColor}
                        onChange={(file) => {
                            field.handleChange(file || new File([], '', { type: ''}));
                            handleTranscriptFileChange(file);
                        }}
                        tooltipContent={fathomTooltip}
                        fileInputRef={transcriptFileInputRef}
                        showExternalIcon={transcriptFileStatus.transcript_id !== 0}
                        />
                    )}
                    </form.Field>
                </div>

                {/* Company Search Strategy */}
                <div className="col-span-2">
                    <form.Field 
                        name="company_search_config"
                        validators={{
                            onChange: ({ value }) => {
                                if (value.strategy === 'hybrid' || value.strategy === 'manual') {
                                    return validateDomains(value.domains);
                                }
                                return undefined;
                            }
                        }}
                    >
                        {(field) => (
                            <CompanySearchStrategy
                                value={field.state.value}
                                onChange={field.handleChange}
                                error={field.state.meta.errors.length > 0 ? field.state.meta.errors.join(', ') : undefined}
                            />
                        )}
                    </form.Field>
                </div>

                <div className="col-span-2">
                <form.Field name="additional_info">
                    {(field) => (
                        <div>
                            <Label htmlFor="additionalInfo">Additional Information</Label>
                            <TextArea
                                placeholder="Type your additional information here..."
                                rows={6}
                                value={field.state.value}
                                onChange={(value) => field.handleChange(value)}
                                className="bg-gray-50 dark:bg-gray-800"
                            />
                        </div>
                    )}
                </form.Field>
                </div>
            </div>
            <div className="col-span-2 mt-2">
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                    {([canSubmit, isSubmittingForm]) => {
                        console.log(canSubmit, isSubmittingForm);
                        return (
                        <Button
                            type="submit"
                            size="sm"
                            className={`w-full ${
                                isSubmittingForm || !canSubmit
                                    ? 'bg-brand-100 opacity-70 cursor-not-allowed' 
                                    : 'bg-brand-100 hover:bg-brand-200'
                            } transition-colors duration-200`}
                            disabled={!canSubmit || isSubmittingForm}
                        >
                            {isSubmittingForm ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                <>
                                    Create Candidate    
                                    <PaperPlaneIcon className="size-5" />
                                </>
                            )}
                        </Button>
                    )}}
                </form.Subscribe>
            </div>

        </Form>
    </div>
  )
  
}