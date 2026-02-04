import { useCampaigns } from "../api/get-campaigns";
import { useNavigate } from "react-router";

export const CampaignsList = () => {
    const { data: campaigns, isLoading } = useCampaigns({
        queryConfig: {
            refetchInterval: 5 * 1000, // 10 seconds
        },
    });

    const navigate = useNavigate();

    const handleCampaignClick = (campaignId: string) => {
        // const lemlistUrl = `https://app.lemlist.com/teams/tea_zgCSSaKS7hNnc3JYp/campaigns-next/${campaignId}`;
        // window.open(lemlistUrl, '_blank');
        navigate(`/campaigns/${campaignId}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-48 w-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    const campaignData = campaigns?.campaigns || [];
    const campaignsOverallStats = campaigns?.campaigns_overall_stats;
    console.log(campaignsOverallStats);

    // Calculate aggregate stats from all campaigns
    const totalReplied = campaignData.reduce((sum, campaign) => sum + campaign.stats.replied, 0);
    
    // Calculate totals from all leads across all campaigns
    const totalCallsBooked = campaignData.reduce((sum, campaign) => {
        const campaignCallsBooked = campaign.leads?.reduce((leadSum, lead) => 
            leadSum + (lead.is_call_booked === "1" ? 1 : 0), 0) || 0;
        return sum + campaignCallsBooked;
    }, 0);
    
    const totalAgreementsSent = campaignData.reduce((sum, campaign) => {
        const campaignAgreementsSent = campaign.leads?.reduce((leadSum, lead) => 
            leadSum + (lead.is_agreement_sent === "1" ? 1 : 0), 0) || 0;
        return sum + campaignAgreementsSent;
    }, 0);
    
    const totalAgreementsSigned = campaignData.reduce((sum, campaign) => {
        const campaignAgreementsSigned = campaign.leads?.reduce((leadSum, lead) => 
            leadSum + (lead.is_agreement_signed === "1" ? 1 : 0), 0) || 0;
        return sum + campaignAgreementsSigned;
    }, 0);

    const statsCards = [
        { title: "Email Responses", value: totalReplied.toString(), subtitle: "Initial Interest", color: "bg-blue-50 border-blue-200" },
        { title: "Calls Booked", value: totalCallsBooked.toString(), subtitle: "Continued Interest", color: "bg-green-50 border-green-200" },
        { title: "Agreements Sent", value: totalAgreementsSent.toString(), subtitle: "High Engagement", color: "bg-orange-50 border-orange-200" },
        { title: "Agreements Signed", value: totalAgreementsSigned.toString(), subtitle: "Next Steps", color: "bg-purple-50 border-purple-200" }
    ];

    // Calculate performance metrics
    const avgOpenRate = campaignData.length > 0 
        ? (campaignData.reduce((sum, campaign) => sum + campaign.average_open_rate_percentage, 0) / campaignData.length).toFixed(1)
        : "0";
    const avgResponseRate = campaignData.length > 0
        ? (campaignData.reduce((sum, campaign) => sum + campaign.average_response_rate_percentage, 0) / campaignData.length).toFixed(1)
        : "0";
    const totalHotLeadsPercentage = campaignsOverallStats?.hot_leads_percentage.toFixed(1) || "0";

    const performanceCards = [
        { title: "Total Active Campaigns", value: campaignData.length.toString(), color: "bg-blue-50 border-blue-200" },
        { title: "Average Open Rate", value: `${avgOpenRate}%`, color: "bg-green-50 border-green-200" },
        { title: "Average Response Rate", value: `${avgResponseRate}%`, color: "bg-yellow-50 border-yellow-200" },
        { title: "Hot Leads Percentage", value: `${totalHotLeadsPercentage}%`, color: "bg-red-50 border-red-200" },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Campaign Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Campaign Pipeline Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((card, index) => (
                        <div key={index} className={`${card.color} rounded-lg p-5 border`}>
                            <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
                            <div className="text-2xl font-bold text-gray-900 mb-1">{card.value}</div>
                            <div className="text-xs text-gray-500">{card.subtitle}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Metrics Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Campaign Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {performanceCards.map((card, index) => (
                        <div key={index} className={`${card.color} rounded-lg p-5 border`}>
                            <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
                            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Campaigns Table Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Active Campaigns</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Campaign Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Leads
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Performance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Hot Leads
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Last Activity
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {campaignData && campaignData.length > 0 ? (
                                campaignData.map((campaign) => (
                                    <tr 
                                        key={campaign.campaign._id} 
                                        className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                        onClick={() => handleCampaignClick(campaign.campaign._id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {campaign.campaign.name}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                Created: {new Date(campaign.campaign.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                                                campaign.campaign.status === 'active' 
                                                    ? 'bg-success-100 text-success-800' 
                                                    : campaign.campaign.status === 'paused'
                                                    ? 'bg-warning-100 text-warning-800'
                                                    : campaign.campaign.status === 'ended'
                                                    ? 'bg-error-100 text-error-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {campaign.campaign.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="bg-blue-light-100 text-blue-light-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                                {campaign.stats.nbLeads}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                                    <span className="text-xs text-gray-600">Opened: {campaign.stats.opened}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                                    <span className="text-xs text-gray-600">Delivered: {campaign.stats.delivered}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                                    <span className="text-xs text-gray-600">Replied: {campaign.stats.replied}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                                    {campaign.leads.filter(lead => lead.is_hot_lead).length}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({campaign.hot_leads_percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="space-y-1">
                                                <div className="text-xs font-medium text-gray-900">
                                                    {campaign.last_activity.type}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {campaign.last_activity.leadFirstName} {campaign.last_activity.leadLastName}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {campaign.last_activity.type ? new Date(campaign.last_activity.createdAt).toLocaleDateString() : "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V8a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1h10a1 1 0 011 1z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 mb-1">No campaigns found</p>
                                            <p className="text-sm text-gray-500">Get started by creating your first campaign</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}