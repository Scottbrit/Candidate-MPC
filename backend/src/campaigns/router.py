from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from src.core.database import get_supabase_admin_client, AsyncClient
from src.config import LEMLIST_API_KEY
from src.campaigns.services.lemlist_async import LemListService
import traceback
from src.campaigns.tasks import create_campaign as create_campaign_task
from src.campaigns.schemas import CampaignStats
from src.campaigns.services.lemlist_async import Campaign
from src.candidates.schemas import ProcessingStatusEnum

router = APIRouter(tags=["Campaigns"])

lemlist_service = LemListService(LEMLIST_API_KEY)

# Frontend endpoints

@router.get("/campaigns/stats")
async def get_campaigns_stats(
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    
    campaigns = await supabase_admin_client.table("lemlist_campaigns").select("*").execute()
    return campaigns

@router.get("/campaigns")
async def get_campaigns(
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    campaigns_overall_stats = {
        "average_open_rate_percentage": 0,
        "average_response_rate_percentage": 0,
        "hot_leads": [],
        "nb_agreements_sent": 0,
        "nb_leads_replied": 0,
        "nb_leads_opened": 0,
        "total_active_campaigns": 0,
        "number_of_leads": 0
    }
    campaigns_response = []
    
    campaigns = await lemlist_service.get_campaigns()

    campaigns_overall_stats["total_active_campaigns"] = len([campaign for campaign in campaigns.get("campaigns") if campaign.get("status") == CampaignStats.RUNNING])

    for campaign in campaigns.get("campaigns"):

        campaign_stats = {
            "nb_leads_opened": 0,
            "nb_leads_replied": 0,
            
        }

        candidate_campaign = await supabase_admin_client.table("candidate_lemlist_campaigns").select("*").eq("lemlist_campaign_id", campaign.get("_id")).execute()

        if len(candidate_campaign.data) == 0:
            continue

        candidate_campaign = candidate_campaign.data[0]

        stats = await lemlist_service.get_campaign_stats(campaign.get("_id"), "2025-01-01", "2025-12-12")

        leads = await lemlist_service.get_campaign_leads(campaign.get("_id"))

        campaigns_overall_stats["number_of_leads"] += len(leads)

        lead_stats = await lemlist_service.get_lead_activities(campaign.get("_id"))

        leads_processed = []
        for lead in leads:
            is_ever_replied = False
            is_ever_opened = False

            lead_processed = {
                **lead,
                "nb_sent": 0,
                "nb_opened": 0,
                "nb_replied": 0,
                "is_hot_lead": False
            }

            for lead_stat in lead_stats:

                if lead_stat.get("leadId") == lead.get("_id"):

                    if lead_stat.get("type") == "emailsReplied":
                        lead_processed["nb_replied"] += 1

                        if lead_stat.get("isFirst") and not is_ever_replied:
                            campaigns_overall_stats["nb_leads_replied"] += 1
                            campaign_stats["nb_leads_replied"] += 1
                            is_ever_replied = True

                    elif lead_stat.get("type") == "emailsOpened":
                        lead_processed["nb_opened"] += 1

                        if lead_stat.get("isFirst") and not is_ever_opened:
                            campaigns_overall_stats["nb_leads_opened"] += 1
                            campaign_stats["nb_leads_opened"] += 1
                            is_ever_opened = True

                    elif lead_stat.get("type") == "emailsSent":
                        lead_processed["nb_sent"] += 1
            
            if lead_processed["nb_opened"] >= 10:
                lead_processed["is_hot_lead"] = True
                campaigns_overall_stats["hot_leads"].append(lead_processed)

            leads_processed.append(lead_processed)
        
        campaign_average_open_rate_percentage = (campaign_stats["nb_leads_opened"] / len(leads_processed)) * 100 if len(leads_processed) > 0 else 0
        campaign_average_response_rate_percentage = (campaign_stats["nb_leads_replied"] / len(leads_processed)) * 100 if len(leads_processed) > 0 else 0
        hot_leads_percentage = (len([lead for lead in leads_processed if lead.get("is_hot_lead")]) / len(leads_processed)) * 100 if len(leads_processed) > 0 else 0


        campaigns_response.append({
            "candidate_campaign": candidate_campaign,
            "campaign": campaign,
            "leads": leads_processed,
            "stats": stats,
            "last_activity": {
                "type": lead_stats[0].get("type") if lead_stats else None,
                "leadFirstName": lead_stats[0].get("leadFirstName") if lead_stats else None,
                "leadLastName": lead_stats[0].get("leadLastName") if lead_stats else None,
                "leadCompanyName": lead_stats[0].get("leadCompanyName") if lead_stats else None,
                "createdAt": lead_stats[0].get("createdAt") if lead_stats else None
            },
            "average_open_rate_percentage": campaign_average_open_rate_percentage,
            "average_response_rate_percentage": campaign_average_response_rate_percentage,
            "hot_leads_percentage": hot_leads_percentage
        })

    campaigns_overall_stats["average_open_rate_percentage"] = sum([campaign.get("average_open_rate_percentage") for campaign in campaigns_response]) / len(campaigns_response) if len(campaigns_response) > 0 else 0
    campaigns_overall_stats["average_response_rate_percentage"] = sum([campaign.get("average_response_rate_percentage") for campaign in campaigns_response]) / len(campaigns_response) if len(campaigns_response) > 0 else 0
    campaigns_overall_stats["hot_leads_percentage"] = (len(campaigns_overall_stats["hot_leads"]) / campaigns_overall_stats['number_of_leads'])*100 if len(campaigns_response) > 0 else 0

    return {
        "campaigns": campaigns_response,
        "campaigns_overall_stats": campaigns_overall_stats
    }


@router.get("/campaigns/{campaign_id}")
async def get_campaign(
    campaign_id: str,
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    campaign: Campaign = await lemlist_service.get_campaign(campaign_id)

    campaign_sequences = await lemlist_service.get_campaign_sequences(campaign_id)

    leads = await lemlist_service.get_campaign_leads(campaign_id)

    return {
        "campaign": campaign,
        "campaign_sequences": campaign_sequences,
        "leads": leads
    }

class CampaignCreate(BaseModel):
    name: str
    candidate_id: int

@router.post("/campaigns")
async def create_campaign(
    # current_user: AdminOnly,
    campaign_create: CampaignCreate,
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    
    try:

        candidate = await supabase_admin_client.table("candidates").select("*").eq("id", campaign_create.candidate_id).execute()

        if len(candidate.data) == 0:
            raise HTTPException(status_code=404, detail="Candidate not found")

        if candidate.data[0].get("processing_status") == ProcessingStatusEnum.CAMPAIGN_CREATED or candidate.data[0].get("processing_status") == ProcessingStatusEnum.CAMPAIGN_CREATING:
            raise HTTPException(status_code=400, detail="Campaign already created or creating")

        if candidate.data[0].get("processing_status") != ProcessingStatusEnum.DECISION_MAKERS_FOUND:
            raise HTTPException(status_code=400, detail="Candidate is not ready for campaign")

        await supabase_admin_client.table("candidates").update({
            "processing_status": ProcessingStatusEnum.CAMPAIGN_CREATING
        }).eq("id", campaign_create.candidate_id).execute()

        lemlist_campaign = await lemlist_service.create_campaign(campaign_create.name)

        campaign_response = await supabase_admin_client.table("candidate_lemlist_campaigns").insert({
            "candidate_id": campaign_create.candidate_id,
            "lemlist_campaign_id": lemlist_campaign.get("_id"),
        }).execute()

        create_campaign_task.apply_async(args=[campaign_create.candidate_id, lemlist_campaign.get("sequenceId")])

        return campaign_response.data[0]
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

class CampaignStepCreate(BaseModel):
    subject: str
    message: str

@router.post("/campaigns/{campaign_id}/steps")
async def create_campaign_step(
    # current_user: AdminOnly,
    campaign_id: str,
):
    
    response = await lemlist_service.get_campaign_sequences(campaign_id)
    
    response2 = await lemlist_service.create_sequence_step(list(response.keys())[0], "", "")

    return response2

class CampaignUpdate(BaseModel):
    stage: int
    subject: str
    message: str
    

class CampaignStepUpdate(BaseModel):
    subject: str
    message: str
    delay: int

@router.put("/campaigns/{campaign_id}/steps/{step_id}")
async def update_campaign_step(
    campaign_id: str,
    step_id: str,
    step: CampaignStepUpdate,
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    
    response = await lemlist_service.get_campaign_sequences(campaign_id)

    campaign_sequence_id = list(response.keys())[0]

    response2 = await lemlist_service.update_sequence_step(campaign_sequence_id, step_id, step.subject, step.message, step.delay)
    
    return response2

@router.delete("/campaigns/{campaign_id}/steps/{step_id}")
async def delete_campaign_step(
    campaign_id: str,
    step_id: str,
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    
    response = await lemlist_service.get_campaign_sequences(campaign_id)

    campaign_sequence_id = list(response.keys())[0]

    response2 = await lemlist_service.delete_sequence_step(campaign_sequence_id, step_id)
    
    return response2

class CampaignLeadCreate(BaseModel):
    email: str
    first_name: str
    last_name: str
    company_name: str
    job_title: str
    linkedin_url: str
    company_domain: str
    variables: dict

@router.post("/campaigns/{campaign_id}/leads")
async def create_campaign_lead(
    campaign_id: str,
    lead: CampaignLeadCreate,
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    response = await lemlist_service.create_lead_in_campaign(campaign_id, lead.email, lead.first_name, lead.last_name, lead.company_name, lead.job_title, lead.linkedin_url, lead.company_domain, lead.variables)
    return response

class UpdateCampaignLeadVariables(BaseModel):
    primary_decision_maker: str = "-"
    primary_decision_maker_first_name: str = "-"
    primary_decision_maker_last_name: str = "-"
    primary_decision_maker_job_title: str = "-"
    primary_decision_maker_linkedin_url: str = "-"
    cc_decision_maker_1: str = "-"
    cc_decision_maker_1_first_name: str = "-"
    cc_decision_maker_1_last_name: str = "-"
    cc_decision_maker_1_job_title: str = "-"
    cc_decision_maker_1_linkedin_url: str = "-"
    cc_decision_maker_2: str = "-"
    cc_decision_maker_2_first_name: str = "-"
    cc_decision_maker_2_last_name: str = "-"
    cc_decision_maker_2_job_title: str = "-"
    cc_decision_maker_2_linkedin_url: str = "-"
    alt_decision_maker_1: str = "-"
    alt_decision_maker_1_first_name: str = "-"
    alt_decision_maker_1_last_name: str = "-"
    alt_decision_maker_1_job_title: str = "-"
    alt_decision_maker_1_linkedin_url: str = "-"
    alt_decision_maker_2: str = "-"
    alt_decision_maker_2_first_name: str = "-"
    alt_decision_maker_2_last_name: str = "-"
    alt_decision_maker_2_job_title: str = "-"
    alt_decision_maker_2_linkedin_url: str = "-"
    is_call_booked: str = "0"
    is_agreement_sent: str = "0"
    is_agreement_signed: str = "0"

@router.post("/campaigns/{campaign_id}/leads/{lead_id}/variables")
async def update_campaign_lead_variables(
    campaign_id: str,
    lead_id: str,
    variables: UpdateCampaignLeadVariables,
):

    print(campaign_id, lead_id, variables.model_dump())

    variables = variables.model_dump(exclude_unset=True)

    if not variables.get("primary_decision_maker") and not variables.get("primary_decision_maker_first_name") and not variables.get("primary_decision_maker_last_name"):
        response = await lemlist_service.update_lead(campaign_id, lead_id, variables.get("primary_decision_maker_first_name"), variables.get("primary_decision_maker_last_name"), variables.get("primary_decision_maker"))
    
    response = await lemlist_service.update_campaign_lead_variables(lead_id, variables)

    return response

class CampaignLeadUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str

@router.post("/campaigns/{campaign_id}/leads/{lead_id}")
async def update_campaign_lead(
    campaign_id: str,
    lead_id: str,
    lead: CampaignLeadUpdate,
):
    response = await lemlist_service.update_lead(campaign_id, lead_id, lead.first_name, lead.last_name, lead.email)
    return response
