import { useForm } from '@tanstack/react-form';
import { useCandidate } from '../api/get-candidate';
import { useUpdateCandidate } from '../api/update-candidate';

import Form from '@/components/form/Form';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/TextArea';
import Button from '@/components/ui/button/Button';
import { PaperPlaneIcon } from '@/components/ui/icons';
import { isNotEmpty } from '../utils/validation';

import type { CandidateExtractedData } from '@/types/api';
import { toast } from 'react-toastify';


interface UpdateCandidateBlindedResumeProps {
  candidateId: string;
}

// Default empty extracted data structure
const createEmptyExtractedData = (): CandidateExtractedData => ({
  candidate_first_name: '',
  candidate_last_name: '',
  target_role: '',
  base_salary_min: undefined,
  base_salary_max: undefined,
  location_preference: [],
  qualifications: {
    ability_to_scale: [],
    leadership_experience: [],
    operations_experience: [],
    finance_experience: []
  },
  core_competencies: [],
  unique_attributes: [],
  proudest_achievement: '',
  career_goals: [],
  availability: ''
});

export const UpdateCandidateBlindedResume = ({ candidateId }: UpdateCandidateBlindedResumeProps) => {
  const candidateQuery = useCandidate({ candidateId: Number(candidateId) });
  const updateCandidateMutation = useUpdateCandidate({
    mutationConfig: {
      onSuccess: () => {
        console.log('Candidate blinded resume updated successfully');
        toast.success('Candidate blinded resume updated successfully');
      },
      onError: (error) => {
        console.error('Error updating candidate blinded resume:', error);
        toast.error(`Failed to update candidate blinded resume. Please try again.`);
      },
    },
  });

  const candidate = candidateQuery.data?.data;
  const extractedData = candidate?.extracted_data || createEmptyExtractedData();

  const form = useForm({
    defaultValues: extractedData,
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      formData.append('extracted_data', JSON.stringify(value));

      await updateCandidateMutation.mutateAsync({
        id: Number(candidateId),
        data: formData,
      });
    },
  });

  // Helper components for array fields
  const ArrayFieldEditor = ({ 
    name, 
    label, 
    placeholder = "Enter value"
  }: { 
    name: keyof CandidateExtractedData; 
    label: string; 
    placeholder?: string;
  }) => (
    <form.Field name={name}>
      {(field) => {
        const values = (field.state.value as string[]) || [];
        
        return (
          <div className="w-full">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {label}
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => field.handleChange([...values, ''])}
              >
                + Add {label.slice(0, -1)}
              </Button>
            </div>
            
            <div className="space-y-3">
              {values.map((value, index) => (
                <div key={index} className="flex items-start space-x-3 w-full">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder={placeholder}
                      value={value}
                      onChange={(e) => {
                        const newValues = [...values];
                        newValues[index] = e.target.value;
                        field.handleChange(newValues);
                      }}
                      className="w-full"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newValues = values.filter((_, i) => i !== index);
                      field.handleChange(newValues);
                    }}
                    className="shrink-0"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              
              {values.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-sm">No {label.toLowerCase()} added yet</p>
                  <p className="text-xs mt-1">Click "Add" button to get started</p>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </form.Field>
  );

  // Helper component for location preferences
  const LocationPreferencesEditor = () => (
    <form.Field name="location_preference">
      {(field) => {
        const locationPrefs = ((field.state.value as CandidateExtractedData['location_preference']) || []);
        
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <Label className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Location Preferences
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => field.handleChange([
                  ...locationPrefs, 
                  { work_arrangement: '', locations: [''] }
                ])}
              >
                + Add Preference
              </Button>
            </div>

            <div className="space-y-4">
              {locationPrefs.map((pref, prefIndex) => (
                <div key={prefIndex} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      Preference {prefIndex + 1}
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newPrefs = locationPrefs.filter((_, i) => i !== prefIndex);
                        field.handleChange(newPrefs);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label>Work Arrangement</Label>
                      <Input
                        type="text"
                        placeholder="e.g., Remote, Hybrid, On-site"
                        value={pref.work_arrangement || ''}
                        onChange={(e) => {
                          const newPrefs = [...locationPrefs];
                          newPrefs[prefIndex] = {
                            ...newPrefs[prefIndex],
                            work_arrangement: e.target.value
                          };
                          field.handleChange(newPrefs);
                        }}
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Locations</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newPrefs = [...locationPrefs];
                            newPrefs[prefIndex] = {
                              ...newPrefs[prefIndex],
                              locations: [...(newPrefs[prefIndex].locations || []), '']
                            };
                            field.handleChange(newPrefs);
                          }}
                        >
                          + Add Location
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {(pref.locations || []).map((location: string, locIndex: number) => (
                          <div key={locIndex} className="flex items-start space-x-3 w-full">
                            <div className="flex-1">
                              <Input
                                type="text"
                                placeholder="Enter location"
                                value={location}
                                onChange={(e) => {
                                  const newPrefs = [...locationPrefs];
                                  const newLocations = [...newPrefs[prefIndex].locations];
                                  newLocations[locIndex] = e.target.value;
                                  newPrefs[prefIndex] = {
                                    ...newPrefs[prefIndex],
                                    locations: newLocations
                                  };
                                  field.handleChange(newPrefs);
                                }}
                                className="w-full"
                              />
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newPrefs = [...locationPrefs];
                                const newLocations = newPrefs[prefIndex].locations.filter((_: string, i: number) => i !== locIndex);
                                newPrefs[prefIndex] = {
                                  ...newPrefs[prefIndex],
                                  locations: newLocations
                                };
                                field.handleChange(newPrefs);
                              }}
                              className="shrink-0"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {locationPrefs.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-sm">No location preferences added yet</p>
                  <p className="text-xs mt-1">Click "Add Preference" button to get started</p>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </form.Field>
  );

  // Helper component for qualifications
  const QualificationsEditor = () => {
    const role = candidate?.role;

    const qualificationFields: { key: string; label: string }[] = [];
    if (role === "COS") {
      qualificationFields.push({ key: 'ability_to_scale', label: 'Ability to build 0→1, 1→100' });
      qualificationFields.push({ key: 'leadership_experience', label: 'Leadership Experience' });
      qualificationFields.push({ key: 'operations_experience', label: 'Operations Experience' });
      qualificationFields.push({ key: 'finance_experience', label: 'Finance Experience' });
    } else if (role === "ENGINEERING") {
      qualificationFields.push({ key: 'ability_to_scale', label: 'Ability to build 0→1, 1→100' });
      qualificationFields.push({ key: 'technical_areas_and_stack', label: 'Technical Areas & Stack' });
      qualificationFields.push({ key: 'systems_and_problems_tackled', label: 'Systems And Problems Tackled' });
      qualificationFields.push({ key: 'impact_and_outcomes', label: 'Impact & Outcomes' });
      qualificationFields.push({ key: 'scope_and_leadership', label: 'Scope & Leadership' });
    } else if (role === "PRODUCT") {
      qualificationFields.push({ key: 'ability_to_scale', label: 'Ability to build 0→1, 1→100' });
      qualificationFields.push({ key: 'product_scope_and_ownership', label: 'Product Scope & Ownership' });
      qualificationFields.push({ key: 'core_responsibilities', label: 'Core Responsibilities' });
      qualificationFields.push({ key: 'impact_and_outcomes', label: 'Impact & Outcomes' });
      qualificationFields.push({ key: 'collaboration_and_team_context', label: 'Leadership & Team building' });
    } else if (role === "MARKETING") {
      qualificationFields.push({ key: 'growth_track_record', label: 'Proven Growth Track Record' });
      qualificationFields.push({ key: 'ability_to_scale', label: 'Ability to go 0→1, 1→100' });
      qualificationFields.push({ key: 'marketing_channel_expertise', label: 'Marketing Channel Expertise' });
      qualificationFields.push({ key: 'business_impact', label: 'Business Impact' });
      qualificationFields.push({ key: 'leadership_and_team_building', label: 'Leadership & Team Building' });
    } else if (role === "REVENUE") {
      qualificationFields.push({ key: 'revenue_success_track_record', label: 'Revenue Success Track Record' });
      qualificationFields.push({ key: 'ability_to_scale_zero_to_one_to_hundred', label: 'Ability to go 0→1, 1→100' });
      qualificationFields.push({ key: 'gtm_motion_expertise', label: 'GTM Motion Expertise' });
      qualificationFields.push({ key: 'business_impact', label: 'Business Impact' });
      qualificationFields.push({ key: 'leadership_and_team_building', label: 'Leadership & Team Building' });
    } else if (role === "OPERATIONS") {
      qualificationFields.push({ key: 'ability_to_build_zero_to_one_and_scale', label: 'Ability to build 0→1, 1→100' });
      qualificationFields.push({ key: 'impact_and_outcomes', label: 'Impact & Outcomes' });
      qualificationFields.push({ key: 'leadership_experience', label: 'Leadership Experience' });
      qualificationFields.push({ key: 'operations_experience', label: 'Operations Experience' });
      qualificationFields.push({ key: 'finance_experience', label: 'Finance Experience' });
    }

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Qualifications</h3>
        
        {qualificationFields.map(({ key, label }) => (
          <form.Field key={key} name={`qualifications.${key}` as keyof CandidateExtractedData}>
            {(field) => {
              const values = (field.state.value as string[]) || [];
              
              return (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <Label>{label}</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => field.handleChange([...values, ''])}
                    >
                      + Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {values.map((value, index) => (
                      <div key={index} className="flex items-start space-x-3 w-full">
                        <div className="flex-1">
                          <Input
                            type="text"
                            placeholder={`Enter ${label.toLowerCase()} item`}
                            value={value}
                            onChange={(e) => {
                              const newValues = [...values];
                              newValues[index] = e.target.value;
                              field.handleChange(newValues);
                            }}
                            className="w-full"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newValues = values.filter((_: string, i: number) => i !== index);
                            field.handleChange(newValues);
                          }}
                          className="shrink-0"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    
                    {values.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-sm">No {label.toLowerCase()} added yet</p>
                        <p className="text-xs mt-1">Click "Add Item" button to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            }}
          </form.Field>
        ))}
      </div>
    );
  };

  if (candidateQuery.isLoading) {
    return <div>Loading candidate data...</div>;
  }

  if (candidateQuery.isError) {
    return <div>Error loading candidate data</div>;
  }

  return (
    <div className="w-full p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Blinded Resume Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Edit the extracted data used for the blinded resume PDF
        </p>
      </div>

      <Form onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}>
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form.Field 
                name="candidate_first_name"
                validators={{
                  onChange: ({ value }) => 
                    !isNotEmpty(value) ? 'First name is required' : undefined
                }}
              >
                {(field) => (
                  <div>
                    <Label htmlFor="candidate_first_name">
                      First Name
                      <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter first name"
                      id="candidate_first_name"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={!!field.state.meta.errors.length}
                      hint={field.state.meta.errors.join(', ')}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="candidate_last_name">
                {(field) => (
                  <div>
                    <Label htmlFor="candidate_last_name">
                      Last Name
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter last name"
                      id="candidate_last_name"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="target_role">
                {(field) => (
                  <div>
                    <Label htmlFor="target_role">Target Role</Label>
                    <Input
                      type="text"
                      placeholder="Enter target role"
                      id="target_role"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="availability">
                {(field) => (
                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Input
                      type="text"
                      placeholder="Enter availability"
                      id="availability"
                      value={field.state.value || ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            {/* Salary Range */}
            <div className="mt-6">
              <Label>Salary Range</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <form.Field name="base_salary_min">
                  {(field) => (
                    <div>
                      <Label htmlFor="base_salary_min">Minimum ($)</Label>
                      <Input
                        type="number"
                        placeholder="Enter minimum salary"
                        id="base_salary_min"
                        value={field.state.value || ''}
                        onChange={(e) => field.handleChange(Number(e.target.value) || undefined)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="base_salary_max">
                  {(field) => (
                    <div>
                      <Label htmlFor="base_salary_max">Maximum ($)</Label>
                      <Input
                        type="number"
                        placeholder="Enter maximum salary"
                        id="base_salary_max"
                        value={field.state.value || ''}
                        onChange={(e) => field.handleChange(Number(e.target.value) || undefined)}
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          {/* Proudest Achievement */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <form.Field name="proudest_achievement">
              {(field) => (
                <div>
                  <Label htmlFor="proudest_achievement">Proudest Achievement</Label>
                  <TextArea
                    placeholder="Describe the proudest achievement..."
                    rows={4}
                    value={field.state.value || ''}
                    onChange={(value) => field.handleChange(value)}
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Career Goals */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <ArrayFieldEditor 
              name="career_goals" 
              label="Career Goals" 
              placeholder="Enter career goal"
            />
          </div>

          {/* Core Competencies */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <ArrayFieldEditor 
              name="core_competencies" 
              label="Core Competencies" 
              placeholder="Enter competency"
            />
          </div>

          {/* Unique Attributes */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <ArrayFieldEditor 
              name="unique_attributes" 
              label="Unique Attributes" 
              placeholder="Enter unique attribute"
            />
          </div>

          {/* Location Preferences */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <LocationPreferencesEditor />
          </div>

          {/* Qualifications */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <QualificationsEditor />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmittingForm]) => (
                <Button
                  type="submit"
                  size="md"
                  className={`${
                    isSubmittingForm || !canSubmit
                      ? 'opacity-70 cursor-not-allowed' 
                      : 'hover:bg-brand-600'
                  } transition-colors duration-200`}
                  disabled={!canSubmit || isSubmittingForm}
                  endIcon={<PaperPlaneIcon className="size-5" />}
                >
                  {isSubmittingForm ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Blinded Resume'
                  )}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </div>
      </Form>
    </div>
  );
};
