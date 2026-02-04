from src.workers.celery import celery_app
from .schemas import Resume, CallTranscript, FileExtension, ProcessingStatusEnum
from src.core.database import supabase
from src.core.openai import openai_client
from src.config import APOLLO_API_KEY
from .services.blinded_resume import BlindedResumeService
from .services.candidate_preferences import CandidatePreferencesService
from .services.apollo import CompanySearchStrategy, ApolloService, EnrichedPerson, convert_funding_stage_to_apollo

blinded_resume_service = BlindedResumeService(openai_client, "gpt-5")
candidate_preferences_service = CandidatePreferencesService(openai_client, "gpt-5")
apollo_service = ApolloService(APOLLO_API_KEY)

@celery_app.task
def process_candidate(candidate_id: int, resume: Resume, call_transcript: CallTranscript, company_search_strategy: CompanySearchStrategy, company_domains: list[str]):

    resume = Resume(**resume)
    call_transcript = CallTranscript(**call_transcript)

    try:
        supabase.table("candidates").update({
            "processing_status": ProcessingStatusEnum.EXTRACTING_CANDIDATE_DATA
        }).eq("id", candidate_id).execute()

        candidate = supabase.table("candidates").select("*").eq("id", candidate_id).execute()

        if len(candidate.data) == 0:
            return False
        
        candidate_data = candidate.data[0]

        blinded_resume = blinded_resume_service.create_blinded_resume(resume, call_transcript, candidate_data['additional_info'], candidate_data['role'])

        candidate_company_preferences = candidate_preferences_service.extract_candidate_preferences(resume, call_transcript, candidate_data['additional_info'])

        supabase.table("candidates").update({
            "extracted_data": blinded_resume,
            "company_preferences": candidate_company_preferences,
            "processing_status": ProcessingStatusEnum.CANDIDATE_DATA_EXTRACTED
        }).eq("id", candidate_id).execute()

        ### APOLLO TASKS SHOULD BE CALLED HERE.
        find_companies_apollo.delay(candidate_id, company_search_strategy, company_domains)

        return True

    except Exception as e:
        print(f"ERROR IN PROCESS CANDIDATE: {str(e)}")
        print(f"ERROR TYPE: {type(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        supabase.table("candidates").update({
            "processing_status": ProcessingStatusEnum.FAILED
        }).eq("id", candidate_id).execute()
        return False
    
@celery_app.task
def find_companies_apollo(candidate_id: int, company_search_strategy: CompanySearchStrategy, company_domains: list[str]):

    try:
        supabase.table("candidates").update({
            "processing_status": ProcessingStatusEnum.SEARCHING_COMPANIES
        }).eq("id", candidate_id).execute()

        candidate = supabase.table("candidates").select("*").eq("id", candidate_id).execute()

        if not candidate.data:
            return False
        
        candidate_data = candidate.data[0]
        preferences = candidate_data.get('company_preferences', {})

        organization_ids_domains_found = apollo_service.search_organizations(
            preferences['locations'], 
            preferences['categories'], 
            convert_funding_stage_to_apollo(preferences['funding_stage']),
            company_domains,
            company_search_strategy
        )
        
        # # Get already used apollo_ids from active companies !!! and filter out companies already used
        # companies_in_campaigns = supabase.table("lemlist_campaign_companies").select("company_id").execute()
        
        # used_apollo_ids = set()
        # if companies_in_campaigns.data:
        #     company_ids = [selection['company_id'] for selection in companies_in_campaigns.data]
        #     companies = supabase.table("companies_apollo").select("apollo_id").in_("id", company_ids).execute()
        #     if companies.data:
        #         used_apollo_ids = set(company['apollo_id'] for company in companies.data if company['apollo_id'])
        
        # # Filter out already used organizations
        # filtered_organization_ids_domains = []
        # for organization_id, organization_domain in organization_ids_domains_found:
        #     if organization_id not in used_apollo_ids:
        #         filtered_organization_ids_domains.append((organization_id, organization_domain))
        
        # Use filtered list for enrichment
        organization_domains_found = [domain for _, domain in organization_ids_domains_found]
        enriched_organization_data = apollo_service.enrich_organizations(organization_domains_found)

        if len(enriched_organization_data) > 0:

            company_ids = []

            for org_data in enriched_organization_data:
                apollo_id = org_data.get('apollo_id')
                if not apollo_id:
                    continue

                # Check if company with this apollo_id already exists
                existing_company = supabase.table("companies_apollo").select("id").eq("apollo_id", apollo_id).execute()

                if existing_company.data:
                    # Update existing company
                    company_id = existing_company.data[0]['id']
                    supabase.table("companies_apollo").update(org_data).eq("id", company_id).execute()
                    company_ids.append(company_id)
                else:
                    # Insert new company
                    new_company = supabase.table("companies_apollo").insert(org_data).execute()
                    if new_company.data:
                        company_ids.append(new_company.data[0]['id'])
            
            # Create candidate_company_selections_apollo records
            if company_ids:
                companies_to_candidate = [{'candidate_id': candidate_id, 'company_id': company_id} for company_id in company_ids]
                supabase.table('candidate_company_selections_apollo').insert(companies_to_candidate).execute()

            supabase.table("candidates").update({
                "processing_status": ProcessingStatusEnum.COMPANIES_MATCHED
            }).eq("id", candidate_id).execute()
        
        else:
            supabase.table("candidates").update({
                "processing_status": ProcessingStatusEnum.NO_COMPANIES_MATCHED
            }).eq("id", candidate_id).execute()

        return True
    
    except Exception as e:
        print(f"ERROR IN FIND COMPANIES APOLLO: {str(e)}")
        print(f"ERROR TYPE: {type(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        supabase.table("candidates").update({
            "processing_status": ProcessingStatusEnum.FAILED
        }).eq("id", candidate_id).execute()

        return False

@celery_app.task
def find_decision_makers_apollo(candidate_id: int):
    try:
        supabase.table("candidates").update({
            "processing_status": ProcessingStatusEnum.FINDING_DECISION_MAKERS
        }).eq("id", candidate_id).execute()

        candidate_company_selections = supabase.table("candidate_company_selections_apollo").select("*").eq("candidate_id", candidate_id).eq("approved_by_candidate", True).execute()
        if len(candidate_company_selections.data) == 0:

            return False
        
        organization_ids = []
        for selection in candidate_company_selections.data:
            company_id = selection['company_id']
            company = supabase.table("companies_apollo").select("*").eq("id", company_id).execute()
            if len(company.data) == 0:

                return False
            
            company_apollo_id = company.data[0]['apollo_id']
            organization_ids.append(company_apollo_id)

        people_apollo_ids = apollo_service.search_people_organizations(organization_ids)

        if len(people_apollo_ids) > 0:
            enriched_people: list[EnrichedPerson] = apollo_service.enrich_people(people_apollo_ids)

            if len(enriched_people) > 0:

                for enriched_person in enriched_people:

                    company = supabase.table("companies_apollo").select("id").eq("apollo_id", enriched_person['organization_id']).execute()

                    try:
                        company_id = company.data[0]['id']
                    except:
                        continue
                    
                    apollo_id = enriched_person.get('apollo_id')
                    enriched_person.pop("organization_id")

                    if apollo_id:
                        # Check if decision maker with this apollo_id already exists
                        existing_decision_maker = supabase.table("company_decision_makers_apollo").select("id").eq("apollo_id", apollo_id).execute()
                        
                        if existing_decision_maker.data:
                            # Update existing decision maker
                            decision_maker_id = existing_decision_maker.data[0]['id']
                            supabase.table("company_decision_makers_apollo").update({
                                **enriched_person,
                                "company_id": company_id
                            }).eq("id", decision_maker_id).execute()
                        else:
                            # Insert new decision maker
                            supabase.table("company_decision_makers_apollo").insert({
                                **enriched_person,
                                "company_id": company_id
                            }).execute()
                    else:
                        # If no apollo_id, still insert (fallback), Apollo ID always exists
                        supabase.table("company_decision_makers_apollo").insert({
                            **enriched_person,
                            "company_id": company_id
                        }).execute()
            
                supabase.table("candidates").update({
                    "processing_status": ProcessingStatusEnum.DECISION_MAKERS_FOUND
                }).eq("id", candidate_id).execute()

                return True
    
    except Exception as e:
        print(f"ERROR IN FIND DECISION MAKERS APOLLO: {str(e)}")
        print(f"ERROR TYPE: {type(e)}")
        import traceback
        print(f"TRACEBACK: {traceback.format_exc()}")
        supabase.table("candidates").update({
            "processing_status": ProcessingStatusEnum.FAILED
        }).eq("id", candidate_id).execute()
        return False
