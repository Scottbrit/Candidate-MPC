import { useQuery, queryOptions } from '@tanstack/react-query';
import type { QueryConfig } from '@/lib/react-query';

import { api } from '@/lib/api-client';

// Campaign types based on the Lemlist API response structure
interface CampaignInfo {
  _id: string;
  name: string;
  createdAt: string;
  createdBy: string;
  status: string;
}

interface Lead {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  founder_name: string;
  cc_decision_maker_1: string;
  _id: string;
  state: string;
  stateSystem: string;
  nb_sent: number;
  nb_opened: number;
  nb_replied: number;
  is_hot_lead: boolean;
  is_call_booked: string;
  is_agreement_sent: string;
  is_agreement_signed: string;
}

interface StepStats {
  index: number;
  sequenceId: string;
  sequenceStep: number;
  invited: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  notDelivered: number;
  bounced: number;
  unsubscribed: number;
}

interface CampaignStats {
  nbLeads: number;
  nbLeadsLaunched: number;
  nbLeadsReached: number;
  nbLeadsOpened: number;
  nbLeadsInteracted: number;
  nbLeadsAnswered: number;
  nbLeadsInterested: number;
  nbLeadsNotInterested: number;
  nbLeadsUnsubscribed: number;
  nbLeadsInterrupted: number;
  messagesSent: number;
  messagesNotSent: number;
  messagesBounced: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  invitationAccepted: number;
  meetingBooked: number;
  steps: StepStats[];
}

interface LastActivity {
  type: string;
  leadFirstName: string;
  leadLastName: string;
  leadCompanyName: string;
  createdAt: string;
}

interface CandidateCampaign {
  candidate_id: number,
  lemlist_campaign_id: string,
  is_agreement_sent: boolean,
  is_agreement_signed: boolean,
  is_call_booked: boolean,
  created_at: string
}

interface CampaignsOverallStats {
  hot_leads_percentage: number;
  number_of_leads: number;
}

export interface Campaign {
  candidate_campaign: CandidateCampaign;
  campaign: CampaignInfo;
  leads: Lead[];
  stats: CampaignStats;
  last_activity: LastActivity;
  average_open_rate_percentage: number;
  average_response_rate_percentage: number;
  hot_leads_percentage: number;
}

export const getCampaigns = (): Promise<{ campaigns: Campaign[], campaigns_overall_stats: CampaignsOverallStats }> => {
  return api.get('/campaigns');
};

export const getCampaignsQueryOptions = () => {
  return queryOptions({
    queryKey: ['campaigns'],
    queryFn: () => getCampaigns(),
  });
};

type UseCampaignsOptions = {
  queryConfig?: QueryConfig<typeof getCampaignsQueryOptions>;
};

export const useCampaigns = ({
  queryConfig,
}: UseCampaignsOptions = {}) => {
  return useQuery({
    ...getCampaignsQueryOptions(),
    ...queryConfig,
  });
};
