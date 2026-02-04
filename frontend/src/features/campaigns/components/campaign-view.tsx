import { useCampaign } from "../api/get-campaign";
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUpdateCampaignStep } from "../api/update-campaign-step";
import { UpdateCampaignTargetContacts } from "./update-campaign-target-contacts";
import { CreateCampaignStage } from "./create-campaign-stage";
import { DeleteCampaignStep } from "./delete-campaign-step";

// Copy to clipboard utility
const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    } catch (err) {
        toast.error(`Failed to copy to clipboard: ${err}`);
    }
};

// HTML conversion utilities
const htmlToPlainText = (html: string): string => {
    return html
        // <p> tag'lerini satır başına çevir
        .replace(/<p[^>]*>/g, '')
        .replace(/<\/p>/g, '\n')
        // <br> tag'lerini satır başına çevir
        .replace(/<br[^>]*>/g, '\n')
        // Diğer HTML tag'lerini temizle
        .replace(/<[^>]+>/g, '')
        // HTML entities'leri decode et
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        // Fazla satır başlarını temizle
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

const plainTextToHtml = (text: string): string => {
    // Her satırı <p> tag'i ile wrap et
    const paragraphs = text
        .split('\n')
        .map(line => {
            if (line.trim() === '') {
                return '<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>';
            }
            return `<p style="margin: 0px; box-sizing: border-box;">${line}</p>`;
        })
        .join('');
    
    return paragraphs;
};

// Type definitions based on the provided data structure
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
        founder_name: string;
        cc_decision_maker_1: string;
        primary_decision_maker: string;
        cc_decision_maker_2: string;
        alt_decision_maker_1: string;
        alt_decision_maker_2: string;
        _id: string;
        state: string;
        stateSystem: string;
    }>;
}

export const CampaignView = () => {
    const { campaignId } = useParams();
    const { data: campaignResponse, isLoading } = useCampaign({ campaignId: campaignId || "" });
    const [currentStageIndex, setCurrentStageIndex] = useState(0);
    const [editingSubject, setEditingSubject] = useState("");
    const [editingMessage, setEditingMessage] = useState("");
    const { mutate: updateCampaign } = useUpdateCampaignStep({ campaignId: campaignId || "" });
    const campaignData = campaignResponse as unknown as CampaignData;
    const sequences = Object.values(campaignData?.campaign_sequences || {});
    const currentSequence = sequences[0];
    const steps = currentSequence?.steps?.sort((a, b) => a.index - b.index) || [];
    const currentStep = steps[currentStageIndex];
    
    // Load plain text version when step changes
    useEffect(() => {
        if (currentStep?.message) {
            setEditingMessage(htmlToPlainText(currentStep.message));
        }
        if (currentStep?.subject) {
            setEditingSubject(currentStep.subject);
        }
    }, [currentStep]);

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

    // Calculate statistics
    const uniqueCompanies = new Set(campaignData.leads.map(lead => lead.companyName)).size;
    // const totalContacts = campaignData.leads.length;
    const totalStages = steps.length;

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'ended': return 'bg-red-100 text-red-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Handle save - convert plain text back to HTML
    const handleSave = () => {
        const htmlContent = plainTextToHtml(editingMessage);
        console.log('Saving HTML content:', htmlContent);
        console.log('Subject:', editingSubject);
        // TODO: API call to save the updated content
        // The htmlContent will be sent to Lemlist with the same format it expects
        updateCampaign({
            campaign_id: campaignId || "",
            step_id: currentStep?._id || "",
            step: {
                subject: editingSubject,
                message: htmlContent,
                delay: currentStep?.delay || 0,
            },
        }, {
            onSuccess: () => {
                toast.success("Campaign updated successfully");
            },
            onError: () => {
                toast.error("Failed to update campaign");
            },
        });
    };
    
    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-row gap-4 justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{campaignData.campaign.name}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            {/* <span className="text-sm text-gray-600">
                                Created by {campaignData.campaign.creator.userEmail}
                            </span> */}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(campaignData.campaign.status)}`}>
                                {campaignData.campaign.status.charAt(0).toUpperCase() + campaignData.campaign.status.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-row gap-3">
                        <button 
                            onClick={handleSave}
                            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
                        >
                            Save
                        </button>
                        <button 
                            onClick={() => window.open(`https://app.lemlist.com/teams/tea_74urN9iMXWkDaKfNw/campaigns-next/${campaignId}`, '_blank')}
                            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Launch Campaign
                        </button>
                    </div>
                </div>

                {/* Campaign Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-blue-light-50 border border-blue-light-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-light-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{uniqueCompanies}</p>
                                <p className="text-sm text-gray-600">Companies</p>
                            </div>
                        </div>
                    </div>
                    {/* <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-success-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{totalContacts}</p>
                                <p className="text-sm text-gray-600">Contacts</p>
                            </div>
                        </div>
                    </div> */}
                    <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{totalStages}</p>
                                <p className="text-sm text-gray-600">Stage Sequence</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-row gap-4 justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Email Sequence</h2>
                    <div className="flex flex-row gap-2">
                        <CreateCampaignStage campaignId={campaignId || ""} />
                        <DeleteCampaignStep campaignId={campaignId || ""} stepId={currentStep?._id || ""} />
                    </div>
                </div>

                <div className="flex flex-row gap-2 items-center mb-6">
                    <button 
                        onClick={() => setCurrentStageIndex(Math.max(0, currentStageIndex - 1))}
                        disabled={currentStageIndex === 0}
                        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    {steps.map((step, index) => (
                        <button
                            key={step._id}
                            onClick={() => setCurrentStageIndex(index)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                index === currentStageIndex 
                                    ? 'bg-brand-500 text-white shadow-sm' 
                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            Stage {step.index}
                        </button>
                    ))}
                    <button 
                        onClick={() => setCurrentStageIndex(Math.min(steps.length - 1, currentStageIndex + 1))}
                        disabled={currentStageIndex === steps.length - 1}
                        className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Current Stage Content */}
                {currentStep && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">{currentStep.index}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {currentStep.index === 1 ? 'Initial Outreach' : `Follow-up ${currentStep.index - 1}`}
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject Line
                                </label>
                                <input 
                                    type="text" 
                                    value={editingSubject}
                                    onChange={(e) => setEditingSubject(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow outline-none"
                                    placeholder="Enter subject line..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Content
                                </label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                                    <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-300 text-sm">
                                        <span className="font-medium text-gray-700">TO:</span> 
                                        <span className="text-gray-600 ml-2">{`{{primary_decision_maker}}`}</span>
                                    </div>
                                    <div 
                                        className="bg-gray-100 px-4 py-2.5 border-b border-gray-300 text-sm cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-between group"
                                        onClick={() => copyToClipboard('{{cc_decision_maker_1}}, {{cc_decision_maker_2}}')}
                                        title="Click to copy CC variables"
                                    >
                                        <div>
                                            <span className="font-medium text-gray-700">CC:</span> 
                                            <span className="text-gray-600 ml-2">{`{{cc_decision_maker_1}}, {{cc_decision_maker_2}}`}</span>
                                        </div>
                                        <svg 
                                            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <textarea 
                                        value={editingMessage}
                                        onChange={(e) => setEditingMessage(e.target.value)}
                                        rows={12}
                                        className="w-full p-4 resize-nonefocus:border-transparent border-0 text-gray-900 outline-none"
                                        placeholder="Enter your email content..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Target Companies & Contacts */}
            <UpdateCampaignTargetContacts campaignId={campaignId || ""} />
        </div>
    );
}