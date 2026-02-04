import { useState } from "react";
import { useCampaign } from "../api/get-campaign";
import { Modal } from "../../../components/ui/modal";
import Select from "../../../components/form/Select";
import { useUpdateCampaignTargetContacts } from "../api/update-campaign-target-contacts";
import { toast } from "react-toastify";

interface CampaignData {
    campaign: {
        name: string;
        createdAt: string;
        status: string;
        creator: {
            userId: string;
            userEmail: string;
        };
        senders: Array<{
            id: string;
            email: string;
            sendUserMailboxId: string;
        }>;
    };
    campaign_sequences: Record<string, {
        _id: string;
        steps: Array<{
            _id: string;
            delay: number;
            emailTemplateId: string;
            index: number;
            sequenceId: string;
            sequenceStep: number;
            subject: string;
            message: string;
            type: string;
        }>;
        level: number;
    }>;
    leads: Array<{
        email: string;
        firstName: string;
        lastName: string;
        companyName: string;
        companyDomain: string,
        jobTitle: string;
        primary_decision_maker: string;
        primary_decision_maker_first_name: string;
        primary_decision_maker_last_name: string;
        primary_decision_maker_job_title: string;
        primary_decision_maker_linkedin_url: string;
        cc_decision_maker_1: string;
        cc_decision_maker_1_first_name: string;
        cc_decision_maker_1_last_name: string;
        cc_decision_maker_1_job_title: string;
        cc_decision_maker_1_linkedin_url: string;
        cc_decision_maker_2: string;
        cc_decision_maker_2_first_name: string;
        cc_decision_maker_2_last_name: string;
        cc_decision_maker_2_job_title: string;
        cc_decision_maker_2_linkedin_url: string;
        alt_decision_maker_1: string;
        alt_decision_maker_1_first_name: string;
        alt_decision_maker_1_last_name: string;
        alt_decision_maker_1_job_title: string;
        alt_decision_maker_1_linkedin_url: string;
        alt_decision_maker_2: string;
        alt_decision_maker_2_first_name: string;
        alt_decision_maker_2_last_name: string;
        alt_decision_maker_2_job_title: string;
        alt_decision_maker_2_linkedin_url: string;
        is_call_booked: string;
        is_agreement_sent: string;
        is_agreement_signed: string;
        _id: string;
        state: string;
        stateSystem: string;
    }>;
}

interface ContactSelection {
    to: string;
    cc1: string;
    cc2: string;
}


export const UpdateCampaignTargetContacts = ({ campaignId }: { campaignId: string }) => {
    const { data: campaignResponse, isLoading } = useCampaign({ campaignId: campaignId || "" });
    const campaignData = campaignResponse as unknown as CampaignData;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<string>("");
    const [contactSelection, setContactSelection] = useState<ContactSelection>({
        to: "",
        cc1: "",
        cc2: ""
    });

    // Track company status - in real implementation this would come from backend
    const [companyStatus, setCompanyStatus] = useState<Record<string, {
        agreementSent: boolean;
        agreementSigned: boolean;
        callBooked: boolean;
    }>>({});

    const { mutate: updateCampaignTargetContacts } = useUpdateCampaignTargetContacts({
        campaignId: campaignId,
        mutationConfig: {
            onSuccess: () => {
                toast.success("Contacts updated successfully");
            }
        }
    });

    const handleStatusToggle = (companyName: string, field: 'agreementSent' | 'agreementSigned' | 'callBooked', currentValue: boolean) => {
        const companyLeads = campaignData.leads.filter(lead => lead.companyName === companyName);
        const primaryLead = companyLeads[0];
        
        if (!primaryLead) return;

        const newValue = !currentValue;

        // Optimistically update UI - ensure all fields are always defined
        setCompanyStatus(prev => ({
            ...prev,
            [companyName]: {
                agreementSent: prev[companyName]?.agreementSent ?? (primaryLead.is_agreement_sent === "1"),
                agreementSigned: prev[companyName]?.agreementSigned ?? (primaryLead.is_agreement_signed === "1"),
                callBooked: prev[companyName]?.callBooked ?? (primaryLead.is_call_booked === "1"),
                [field]: newValue
            }
        }));

        // Map field names to backend field names
        const fieldMap = {
            agreementSent: 'is_agreement_sent',
            agreementSigned: 'is_agreement_signed',
            callBooked: 'is_call_booked'
        };

        // Send update to backend
        updateCampaignTargetContacts({
            campaignId: campaignId,
            lead_id: primaryLead._id,
            variables: {
                [fieldMap[field]]: newValue ? "1" : "0"
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex h-48 w-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (!campaignData) {
        return <div>No campaign data found</div>;
    }

    const handleEditContacts = (companyName: string, primaryLead: CampaignData["leads"][0]) => {
        setSelectedCompany(companyName);
        setContactSelection({
            to: primaryLead.primary_decision_maker || "",
            cc1: primaryLead.cc_decision_maker_1 || "",
            cc2: primaryLead.cc_decision_maker_2 || ""
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const companyLeads = campaignData.leads.filter(lead => lead.companyName === selectedCompany);
        const primaryLead = companyLeads[0];
        
        if (!primaryLead) return;

        // Create a comprehensive metadata map for all emails
        type ContactMetadata = {
            firstName: string;
            lastName: string;
            jobTitle: string;
            linkedinUrl: string;
        };

        const emailToMetadata: Record<string, ContactMetadata> = {
            [primaryLead.primary_decision_maker]: {
                firstName: primaryLead.primary_decision_maker_first_name || '',
                lastName: primaryLead.primary_decision_maker_last_name || '',
                jobTitle: primaryLead.primary_decision_maker_job_title || '',
                linkedinUrl: primaryLead.primary_decision_maker_linkedin_url || '',
            },
            [primaryLead.cc_decision_maker_1]: {
                firstName: primaryLead.cc_decision_maker_1_first_name || '',
                lastName: primaryLead.cc_decision_maker_1_last_name || '',
                jobTitle: primaryLead.cc_decision_maker_1_job_title || '',
                linkedinUrl: primaryLead.cc_decision_maker_1_linkedin_url || '',
            },
            [primaryLead.cc_decision_maker_2]: {
                firstName: primaryLead.cc_decision_maker_2_first_name || '',
                lastName: primaryLead.cc_decision_maker_2_last_name || '',
                jobTitle: primaryLead.cc_decision_maker_2_job_title || '',
                linkedinUrl: primaryLead.cc_decision_maker_2_linkedin_url || '',
            },
            [primaryLead.alt_decision_maker_1]: {
                firstName: primaryLead.alt_decision_maker_1_first_name || '',
                lastName: primaryLead.alt_decision_maker_1_last_name || '',
                jobTitle: primaryLead.alt_decision_maker_1_job_title || '',
                linkedinUrl: primaryLead.alt_decision_maker_1_linkedin_url || '',
            },
            [primaryLead.alt_decision_maker_2]: {
                firstName: primaryLead.alt_decision_maker_2_first_name || '',
                lastName: primaryLead.alt_decision_maker_2_last_name || '',
                jobTitle: primaryLead.alt_decision_maker_2_job_title || '',
                linkedinUrl: primaryLead.alt_decision_maker_2_linkedin_url || '',
            },
        };

        // Helper to get metadata for an email
        const getMetadata = (email: string): ContactMetadata => {
            return emailToMetadata[email] || { firstName: '', lastName: '', jobTitle: '', linkedinUrl: '' };
        };

        // Get newly selected values
        const newPrimary = contactSelection.to;
        const newCC1 = contactSelection.cc1;
        const newCC2 = contactSelection.cc2;

        // Get old values from primary/cc positions
        const oldPrimary = primaryLead.primary_decision_maker;
        const oldCC1 = primaryLead.cc_decision_maker_1;
        const oldCC2 = primaryLead.cc_decision_maker_2;
        const oldAlt1 = primaryLead.alt_decision_maker_1;
        const oldAlt2 = primaryLead.alt_decision_maker_2;

        // Create a pool of all available emails for alt positions
        const altPool: string[] = [];

        // Add old primary/cc values that are not in new primary/cc positions
        if (oldPrimary && oldPrimary !== newPrimary && oldPrimary !== newCC1 && oldPrimary !== newCC2) {
            altPool.push(oldPrimary);
        }
        if (oldCC1 && oldCC1 !== newPrimary && oldCC1 !== newCC1 && oldCC1 !== newCC2) {
            altPool.push(oldCC1);
        }
        if (oldCC2 && oldCC2 !== newPrimary && oldCC2 !== newCC1 && oldCC2 !== newCC2) {
            altPool.push(oldCC2);
        }

        // Add old alt values that are not being used in new primary/cc positions
        if (oldAlt1 && oldAlt1 !== newPrimary && oldAlt1 !== newCC1 && oldAlt1 !== newCC2) {
            altPool.push(oldAlt1);
        }
        if (oldAlt2 && oldAlt2 !== newPrimary && oldAlt2 !== newCC1 && oldAlt2 !== newCC2) {
            altPool.push(oldAlt2);
        }

        // Remove duplicates from alt pool
        const uniqueAltPool = Array.from(new Set(altPool));

        // Get metadata for new positions
        const primaryMeta = getMetadata(newPrimary);
        const cc1Meta = getMetadata(newCC1);
        const cc2Meta = getMetadata(newCC2);
        const alt1Meta = getMetadata(uniqueAltPool[0] || '');
        const alt2Meta = getMetadata(uniqueAltPool[1] || '');

        // Build the final structure with all metadata
        const updatedLeadData = {
            primary_decision_maker: newPrimary,
            primary_decision_maker_first_name: primaryMeta.firstName,
            primary_decision_maker_last_name: primaryMeta.lastName,
            primary_decision_maker_job_title: primaryMeta.jobTitle,
            primary_decision_maker_linkedin_url: primaryMeta.linkedinUrl,
            
            cc_decision_maker_1: newCC1 || "",
            cc_decision_maker_1_first_name: cc1Meta.firstName,
            cc_decision_maker_1_last_name: cc1Meta.lastName,
            cc_decision_maker_1_job_title: cc1Meta.jobTitle,
            cc_decision_maker_1_linkedin_url: cc1Meta.linkedinUrl,
            
            cc_decision_maker_2: newCC2 || "",
            cc_decision_maker_2_first_name: cc2Meta.firstName,
            cc_decision_maker_2_last_name: cc2Meta.lastName,
            cc_decision_maker_2_job_title: cc2Meta.jobTitle,
            cc_decision_maker_2_linkedin_url: cc2Meta.linkedinUrl,
            
            alt_decision_maker_1: uniqueAltPool[0] || "",
            alt_decision_maker_1_first_name: alt1Meta.firstName,
            alt_decision_maker_1_last_name: alt1Meta.lastName,
            alt_decision_maker_1_job_title: alt1Meta.jobTitle,
            alt_decision_maker_1_linkedin_url: alt1Meta.linkedinUrl,
            
            alt_decision_maker_2: uniqueAltPool[1] || "",
            alt_decision_maker_2_first_name: alt2Meta.firstName,
            alt_decision_maker_2_last_name: alt2Meta.lastName,
            alt_decision_maker_2_job_title: alt2Meta.jobTitle,
            alt_decision_maker_2_linkedin_url: alt2Meta.linkedinUrl,
        };

        console.log("Saving contacts for company:", selectedCompany);
        console.log("Updated lead data:", updatedLeadData);

        updateCampaignTargetContacts({
            campaignId: campaignId,
            lead_id: primaryLead._id,
            variables: updatedLeadData
        });
        
        setIsModalOpen(false);
    };

    const getAvailableOptions = (currentLead: CampaignData["leads"][0], excludeField?: string) => {
        // Create a map of emails to job titles
        const emailToJobTitle: Record<string, string> = {
            [currentLead.primary_decision_maker]: currentLead.primary_decision_maker_job_title || '',
            [currentLead.cc_decision_maker_1]: currentLead.cc_decision_maker_1_job_title || '',
            [currentLead.cc_decision_maker_2]: currentLead.cc_decision_maker_2_job_title || '',
            [currentLead.alt_decision_maker_1]: currentLead.alt_decision_maker_1_job_title || '',
            [currentLead.alt_decision_maker_2]: currentLead.alt_decision_maker_2_job_title || '',
        };

        // Get all decision makers and remove duplicates
        const allDecisionMakers = [
            currentLead.primary_decision_maker,
            currentLead.cc_decision_maker_1,
            currentLead.cc_decision_maker_2,
            currentLead.alt_decision_maker_1,
            currentLead.alt_decision_maker_2
        ].filter(email => email && email.trim() !== "");

        // Remove duplicates using Set
        const uniqueDecisionMakers = Array.from(new Set(allDecisionMakers));

        const selectedEmails = [
            contactSelection.to,
            contactSelection.cc1,
            contactSelection.cc2
        ].filter(email => email && email.trim() !== "");

        return uniqueDecisionMakers
            .filter(email => {
                // Exclude already selected emails, but allow the current field's value
                if (excludeField === "to" && email === contactSelection.to) return true;
                if (excludeField === "cc1" && email === contactSelection.cc1) return true;
                if (excludeField === "cc2" && email === contactSelection.cc2) return true;
                return !selectedEmails.includes(email);
            })
            .map(email => {
                const jobTitle = emailToJobTitle[email];
                return {
                    value: email,
                    label: jobTitle ? `${email} (${jobTitle})` : email
                };
            });
    };

    const renderEditModal = () => {
        const companyLeads = campaignData.leads.filter(lead => lead.companyName === selectedCompany);
        const primaryLead = companyLeads[0];
        
        if (!primaryLead) return null;

        return (
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-[600px] p-5 lg:p-10">
                <div className="p-6 max-w-2xl">
                    <h2 className="text-xl font-semibold mb-4">Edit Contacts for {selectedCompany}</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                TO:
                            </label>
                            <Select
                                options={getAvailableOptions(primaryLead, "to")}
                                placeholder="Select primary recipient"
                                defaultValue={contactSelection.to}
                                onChange={(value) => setContactSelection(prev => ({ ...prev, to: value }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CC 1:
                            </label>
                            <Select
                                options={getAvailableOptions(primaryLead, "cc1")}
                                placeholder="Select first CC"
                                defaultValue={contactSelection.cc1}
                                onChange={(value) => setContactSelection(prev => ({ ...prev, cc1: value }))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                CC 2:
                            </label>
                            <Select
                                options={getAvailableOptions(primaryLead, "cc2")}
                                placeholder="Select second CC"
                                defaultValue={contactSelection.cc2}
                                onChange={(value) => setContactSelection(prev => ({ ...prev, cc2: value }))}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Target Companies & Contacts</h3>
                </div>
                
                <div className="p-6">
                    <div className="space-y-4">
                        {/* Group leads by company */}
                        {Array.from(new Set(campaignData.leads.map(lead => lead.companyName))).map(companyName => {
                            const companyLeads = campaignData.leads.filter(lead => lead.companyName === companyName);
                            const primaryLead = companyLeads.find(lead => lead.email === lead.primary_decision_maker) || companyLeads[0];
                            
                            // Use companyStatus if exists, otherwise use values from primaryLead
                            // Always ensure boolean values to prevent controlled/uncontrolled input warnings
                            const status = {
                                agreementSent: companyStatus[companyName]?.agreementSent ?? (primaryLead.is_agreement_sent === "1"),
                                agreementSigned: companyStatus[companyName]?.agreementSigned ?? (primaryLead.is_agreement_signed === "1"),
                                callBooked: companyStatus[companyName]?.callBooked ?? (primaryLead.is_call_booked === "1")
                            };

                            return (
                                <div key={companyName} className="border border-gray-200 rounded-lg">
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                        <span className="font-medium">{companyName}</span>
                                        <div className="flex items-center gap-4">
                                            {/* Status Checkboxes */}
                                            <div className="flex items-center gap-3 text-xs">
                                                <label className="flex items-center gap-1.5 cursor-pointer hover:text-brand-600 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                                        checked={status.callBooked}
                                                        onChange={() => handleStatusToggle(companyName, 'callBooked', status.callBooked)}
                                                    />
                                                    <span>📞 Call</span>
                                                </label>

                                                <label className="flex items-center gap-1.5 cursor-pointer hover:text-brand-600 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                                        checked={status.agreementSent}
                                                        onChange={() => handleStatusToggle(companyName, 'agreementSent', status.agreementSent)}
                                                    />
                                                    <span>📄 Sent</span>
                                                </label>
                                                
                                                <label className="flex items-center gap-1.5 cursor-pointer hover:text-brand-600 transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                                                        checked={status.agreementSigned}
                                                        onChange={() => handleStatusToggle(companyName, 'agreementSigned', status.agreementSigned)}
                                                    />
                                                    <span>✓ Signed</span>
                                                </label>
                                                
                                            </div>

                                            <button 
                                                onClick={() => handleEditContacts(companyName, primaryLead)}
                                                className="text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors"
                                            >
                                                Edit Contacts
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-sm"><span className="font-medium">TO:</span> {primaryLead.primary_decision_maker}</span> <span className="text-sm font-medium">({primaryLead.primary_decision_maker_job_title})</span>
                                                { primaryLead.cc_decision_maker_1 && <div className="text-sm"><span className="font-medium">CC 1:</span> {primaryLead.cc_decision_maker_1} <span className="text-sm font-medium">({primaryLead.cc_decision_maker_1_job_title})</span></div> }
                                                { primaryLead.cc_decision_maker_2 && <div className="text-sm"><span className="font-medium">CC 2:</span> {primaryLead.cc_decision_maker_2} <span className="text-sm font-medium">({primaryLead.cc_decision_maker_2_job_title})</span></div> }
                                            </div>
                                            
                                            {companyLeads.length > 1 && (
                                                <div className="text-sm text-gray-500">
                                                    + {companyLeads.length - 1} more contacts
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {renderEditModal()}
        </>
    );
};