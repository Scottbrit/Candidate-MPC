from src.workers.celery import celery_app
from src.campaigns.services.lemlist_sync import LemListSyncService
from src.core.database import supabase
from src.config import LEMLIST_API_KEY
from src.campaigns.utils import analyze_decision_makers
from datetime import datetime, timedelta
from src.campaigns.schemas import CampaignStats
from src.candidates.schemas import ProcessingStatusEnum

# Use sync service for Celery tasks
lemlist_service = LemListSyncService(LEMLIST_API_KEY)

@celery_app.task
def create_campaign(candidate_id: int, sequence_id: str):

    campaign = supabase.table("candidate_lemlist_campaigns").select("*").eq("candidate_id", candidate_id).execute()
    
    if len(campaign.data) == 0:
        raise Exception("Candidate not found")
    
    campaign = campaign.data[0]
    
    lemlist_campaign = lemlist_service.get_campaign(campaign['lemlist_campaign_id'])

    # Create leads

    companies_approved_by_candidate = supabase.table("candidate_company_selections_apollo").select("company_id").eq("candidate_id", candidate_id).eq("approved_by_candidate", True).execute()

    companies_approved_by_candidate_ids = [company_approved.get("company_id") for company_approved in companies_approved_by_candidate.data]

    companies_apollo_approved = supabase.table("companies_apollo").select("*").in_("id", companies_approved_by_candidate_ids).execute()

    # # Get already used apollo_ids from active companies !!! and filter out companies already used
    # companies_in_campaigns = supabase.table("lemlist_campaign_companies").select("company_id").execute()

    # used_apollo_ids = set()
    # if companies_in_campaigns.data:
    #     company_ids = [selection['company_id'] for selection in companies_in_campaigns.data]
    #     companies = supabase.table("companies_apollo").select("apollo_id").in_("id", company_ids).execute()
    #     if companies.data:
    #         used_apollo_ids = set(company['apollo_id'] for company in companies.data if company['apollo_id'])

    # companies_apollo_approved_filtered = [company for company in companies_apollo_approved.data if company.get("apollo_id") not in used_apollo_ids]

    for company in companies_apollo_approved.data:

        decision_makers = supabase.table("company_decision_makers_apollo").select("*").eq("company_id", company.get("id")).execute()

        if len(decision_makers.data) == 0:
            continue

        decision_makers_list = []

        for decision_maker in decision_makers.data:

            if decision_maker.get("email") is None:
                continue

            decision_makers_list.append({
                "first_name": decision_maker.get("first_name"),
                "last_name": decision_maker.get("last_name"),
                "linkedin_url": decision_maker.get("linkedin_url"),
                "company_name": company.get("name"),
                "company_domain": company.get("primary_domain"),
                "job_title": decision_maker.get("title"),
                "email": decision_maker.get("email"),
                "seniority": decision_maker.get("seniority"),
                "title": decision_maker.get("title"),
                "headline": decision_maker.get("headline"),
                
                "decision_maker_id": decision_maker.get("id")
            })
            
        
        decision_makers_result = analyze_decision_makers(decision_makers_list)

        if decision_makers_result.primary_decision_maker_idx is None:
            continue

        lemlist_lead = lemlist_service.create_lead_in_campaign(
            campaign_id = lemlist_campaign.get("_id"),
            email = decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("email"),
            first_name = decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("first_name"),
            last_name = decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("last_name"),
            company_name = company.get("name"),
            job_title = decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("title"),
            linkedin_url = decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("linkedin_url"),
            company_domain = company.get("primary_domain"),
            variables = {
                "primary_decision_maker": decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("email", ""),
                "primary_decision_maker_first_name": decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("first_name", ""),
                "primary_decision_maker_last_name": decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("last_name", ""),
                "primary_decision_maker_job_title": decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("job_title", ""),
                "primary_decision_maker_linkedin_url": decision_makers_list[decision_makers_result.primary_decision_maker_idx].get("linkedin_url", ""),
                "cc_decision_maker_1": decision_makers_list[decision_makers_result.cc_decision_maker_1_idx].get("email", "") if decision_makers_result.cc_decision_maker_1_idx is not None else "",
                "cc_decision_maker_1_first_name": decision_makers_list[decision_makers_result.cc_decision_maker_1_idx].get("first_name", "") if decision_makers_result.cc_decision_maker_1_idx is not None else "",
                "cc_decision_maker_1_last_name": decision_makers_list[decision_makers_result.cc_decision_maker_1_idx].get("last_name", "") if decision_makers_result.cc_decision_maker_1_idx is not None else "",
                "cc_decision_maker_1_job_title": decision_makers_list[decision_makers_result.cc_decision_maker_1_idx].get("job_title", "") if decision_makers_result.cc_decision_maker_1_idx is not None else "",
                "cc_decision_maker_1_linkedin_url": decision_makers_list[decision_makers_result.cc_decision_maker_1_idx].get("linkedin_url", "") if decision_makers_result.cc_decision_maker_1_idx is not None else "",
                "cc_decision_maker_2": decision_makers_list[decision_makers_result.cc_decision_maker_2_idx].get("email", "") if decision_makers_result.cc_decision_maker_2_idx is not None else "",
                "cc_decision_maker_2_first_name": decision_makers_list[decision_makers_result.cc_decision_maker_2_idx].get("first_name", "") if decision_makers_result.cc_decision_maker_2_idx is not None else "",
                "cc_decision_maker_2_last_name": decision_makers_list[decision_makers_result.cc_decision_maker_2_idx].get("last_name", "") if decision_makers_result.cc_decision_maker_2_idx is not None else "",
                "cc_decision_maker_2_job_title": decision_makers_list[decision_makers_result.cc_decision_maker_2_idx].get("job_title", "") if decision_makers_result.cc_decision_maker_2_idx is not None else "",
                "cc_decision_maker_2_linkedin_url": decision_makers_list[decision_makers_result.cc_decision_maker_2_idx].get("linkedin_url", "") if decision_makers_result.cc_decision_maker_2_idx is not None else "",
                "alt_decision_maker_1": decision_makers_list[decision_makers_result.alt_decision_maker_1_idx].get("email", "") if decision_makers_result.alt_decision_maker_1_idx is not None else "",
                "alt_decision_maker_1_first_name": decision_makers_list[decision_makers_result.alt_decision_maker_1_idx].get("first_name", "") if decision_makers_result.alt_decision_maker_1_idx is not None else "",
                "alt_decision_maker_1_last_name": decision_makers_list[decision_makers_result.alt_decision_maker_1_idx].get("last_name", "") if decision_makers_result.alt_decision_maker_1_idx is not None else "",
                "alt_decision_maker_1_job_title": decision_makers_list[decision_makers_result.alt_decision_maker_1_idx].get("job_title", "") if decision_makers_result.alt_decision_maker_1_idx is not None else "",
                "alt_decision_maker_1_linkedin_url": decision_makers_list[decision_makers_result.alt_decision_maker_1_idx].get("linkedin_url", "") if decision_makers_result.alt_decision_maker_1_idx is not None else "",
                "alt_decision_maker_2": decision_makers_list[decision_makers_result.alt_decision_maker_2_idx].get("email", "") if decision_makers_result.alt_decision_maker_2_idx is not None else "",
                "alt_decision_maker_2_first_name": decision_makers_list[decision_makers_result.alt_decision_maker_2_idx].get("first_name", "") if decision_makers_result.alt_decision_maker_2_idx is not None else "",
                "alt_decision_maker_2_last_name": decision_makers_list[decision_makers_result.alt_decision_maker_2_idx].get("last_name", "") if decision_makers_result.alt_decision_maker_2_idx is not None else "",
                "alt_decision_maker_2_job_title": decision_makers_list[decision_makers_result.alt_decision_maker_2_idx].get("job_title", "") if decision_makers_result.alt_decision_maker_2_idx is not None else "",
                "alt_decision_maker_2_linkedin_url": decision_makers_list[decision_makers_result.alt_decision_maker_2_idx].get("linkedin_url", "") if decision_makers_result.alt_decision_maker_2_idx is not None else "",
                "senderSignature": "Test Signature",
                "is_call_booked": 0,
                "is_agreement_sent": 0,
                "is_agreement_signed": 0,
            }
        )

        if lemlist_lead is None: # Lead already exists in another campaign
            continue

        # save company to db

        # supabase.table("lemlist_campaign_companies").insert({
        #     "campaign_id": campaign['lemlist_campaign_id'],
        #     "company_id": company.get("id"),
        # }).execute()

        # Save campaign leads in supabase
        # for lead_idx in [decision_makers_result.primary_decision_maker_idx, decision_makers_result.cc_decision_maker_1_idx, decision_makers_result.cc_decision_maker_2_idx, decision_makers_result.alt_decision_maker_1_idx, decision_makers_result.alt_decision_maker_2_idx]:

        #     if lead_idx is None:
        #         continue

        #     supabase.table("lemlist_campaign_leads").insert({
        #         "campaign_id": campaign['lemlist_campaign_id'],
        #         "decision_maker_id": decision_makers_list[lead_idx].get("decision_maker_id"),
        #         "lemlist_lead_id": lemlist_lead.get("_id")
        #         }).execute()
    
    # Create sequence steps

    lemlist_service.create_sequence_step(
        sequence_id = sequence_id,
        subject = "Confidential Introduction - exceptional CoS candidate",
        message = """<p style="margin: 0px; box-sizing: border-box;">Hi {{firstName}},</p><p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p><p style="margin: 0px; box-sizing: border-box;">I'm reaching out to give you early access to an outstanding Chief of Staff candidate who's actively exploring her next career move — she's specifically identified {{companyName}} as one of her top choices.</p><p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p><p style="margin: 0px; box-sizing: border-box;">She's a proven leader in tech with 12+ years of experience driving executive operations and scaling businesses, contributing to 9x revenue growth at one of her previous companies. She's incredibly selective and is actively pursuing only a few carefully chosen opportunities with organizations that align with her values and vision.</p><p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p><p style="margin: 0px; box-sizing: border-box;">Attached is a confidential, blind version of her profile for your review.</p><p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p><p style="margin: 0px; box-sizing: border-box;">If you'd like to explore adding someone of this caliber to your leadership team, I'd be happy to set up a chat (PS: she's turned down multiple COO roles because she's obsessed with the CoS role!).</p><p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p><p style="margin: 0px; box-sizing: border-box;">Looking forward to hearing from you!</p><p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p><p style="margin: 0px; box-sizing: border-box;">Best regards,</p>"""
    )

    lemlist_service.create_sequence_step(
        sequence_id = sequence_id,
        subject = "Confidential Introduction - exceptional CoS candidate",
        message = """
<p style="margin: 0px; box-sizing: border-box;">Hi all,</p>
<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>
<p style="margin: 0px; box-sizing: border-box;">I believe this candidate's expertise could be a game-changer for your leadership team. She's actively exploring opportunities and won't be on the market for long, but she did identify {{companyName}} as one of her top targets.</p>
<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>
<p style="margin: 0px; box-sizing: border-box;">Let me know if you'd like to connect! : )</p>
<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>
<p style="margin: 0px; box-sizing: border-box;">{{senderSignature}}</p>        
        """,
        delay = 2
    )

    lemlist_service.create_sequence_step(
        sequence_id = sequence_id,
        subject = "Confidential Introduction - exceptional CoS candidate",
        message = """
<p style="margin: 0px; box-sizing: border-box;">Hi all,</p>
<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>
<p style="margin: 0px; box-sizing: border-box;">I wanted to reach out one final time about the incredible Chief of Staff candidate I mentioned previously. She's currently engaging with a few top-tier organizations, and her background in scaling executive operations and building high-performing teams makes her one of the most sought-after candidates we've represented.</p>
<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>
<p style="margin: 0px; box-sizing: border-box;">If you're interested in exploring the opportunity to bring someone of her caliber onto your team, please let me know.</p>
<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>
<p style="margin: 0px; box-sizing: border-box;">I think this is a rare chance to add a leader who can drive meaningful impact and elevate your Office of the CEO.</p>
<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>
<p style="margin: 0px; box-sizing: border-box;">Looking forward to hearing your thoughts!</p>
<p style="margin: 0px; box-sizing: border-box;"><br style="box-sizing: border-box;"></p>
<p style="margin: 0px; box-sizing: border-box;">{{senderSignature}}</p> 
        """,
        delay = 3
    )

    # Create campaign stats

    # start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    # end_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    # lemlist_campaign_stats = lemlist_service.get_campaign_stats(lemlist_campaign.get("_id"), start_date, end_date)

    # campaign_stats = supabase.table("lemlist_campaign_stats").insert({
    #         "campaign_id": lemlist_campaign.get("_id"),
    #         "nb_leads": lemlist_campaign_stats.get("nbLeads"),
    #         "nb_leads_launched": lemlist_campaign_stats.get("nbLeadsLaunched"),
    #         "nb_leads_reached": lemlist_campaign_stats.get("nbLeadsReached"),
    #         "nb_leads_opened": lemlist_campaign_stats.get("nbLeadsOpened"),
    #         "nb_leads_interacted": lemlist_campaign_stats.get("nbLeadsInteracted"),
    #         "nb_leads_answered": lemlist_campaign_stats.get("nbLeadsAnswered"),
    #         "messages_sent": lemlist_campaign_stats.get("messagesSent"),
    #         "messages_bounced": lemlist_campaign_stats.get("messagesBounced")
    #     }).execute()

    # supabase.table("lemlist_campaigns").update({
    #     "state": CampaignStats.DRAFT
    # }).eq("lemlist_campaign_id", lemlist_campaign.get("_id")).execute()

    supabase.table("candidates").update({
        "processing_status": ProcessingStatusEnum.CAMPAIGN_CREATED
    }).eq("id", campaign.get("candidate_id")).execute()

    return True