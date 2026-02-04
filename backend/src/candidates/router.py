from fastapi import APIRouter, Form, File, UploadFile, HTTPException, Depends, Body
from supabase import AsyncClient
from supabase_auth.errors import AuthApiError
from src.core.database import get_supabase_admin_client
from .schemas import ResumeSourceEnum, FileExtension, Resume, CallTranscriptSourceEnum, CallTranscript, ProcessingStatusEnum
import json
from .services.ashby import AshbyService
from .services.fathom import FathomService
from src.config import ASHBY_API_KEY, FATHOM_API_KEY
from .tasks import process_candidate, find_decision_makers_apollo
from typing import Optional, Any
import aiosmtplib

from src.dependencies import AdminOrCandidate
from src.dependencies import get_candidate_lifecycle_service
from src.services.candidate_lifecycle_service import CandidateLifecycleService

from src.config import EMAIL_HOSTNAME, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD
from email.message import EmailMessage

ashby_service = AshbyService(ashby_api_key=ASHBY_API_KEY)
fathom_service = FathomService(fathom_api_key=FATHOM_API_KEY)

router = APIRouter(tags=["Candidates"])

@router.get("/candidates")
async def get_candidates(supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)):
    candidates = await supabase_admin_client.table("candidates").select("*").execute()

    return candidates

@router.delete("/candidates/{candidate_id}")
async def delete_candidate(candidate_id: int, lifecycle_service: CandidateLifecycleService = Depends(get_candidate_lifecycle_service)):
    
    await lifecycle_service.delete_candidate_safely(candidate_id)

    return {"message": "Candidate deleted successfully"}

@router.get("/candidates/{candidate_id}")
async def get_candidate(candidate_id: int, supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)):
    candidate = await supabase_admin_client.table("candidates").select("*").eq("id", int(candidate_id)).limit(1).single().execute()

    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    return candidate

@router.post("/candidates")
async def create_candidate(
    first_name: str = Form(...), 
    last_name: str = Form(...), 
    email: str = Form(...), 
    linkedin_url: str = Form(...), 
    role: str = Form(...),
    additional_info: str = Form(...), 
    resume_file: UploadFile = File(...), 
    call_transcript_file: UploadFile = File(...), 
    resume_source: str = Form(...), 
    ashby_email: str = Form(...), 
    call_transcript_source: str = Form(...), 
    call_transcript_id: int = Form(...), 
    company_search_strategy: str = Form(...), 
    company_domains: str = Form(...),
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    try:
        if isinstance(company_domains, str):
            parsed_domains = json.loads(company_domains)
        else:
            parsed_domains = company_domains
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for company_domains")
    
    try:
        response = await supabase_admin_client.auth.admin.create_user(
            {
                "email": email,
                "password": "123456",
                "user_metadata": {
                    "role": "candidate"
                }
            }
        )
    except AuthApiError as e:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    if resume_source == ResumeSourceEnum.ASHBY:
        resume_data, resume_handle_id = await ashby_service.get_resume_from_ashby(ashby_email)
        resume_bytes: bytes = resume_data['bytes']
        resume_filename = resume_data['filename']
    elif resume_source == ResumeSourceEnum.LOCAL:
        resume_handle_id = None
        resume_bytes: bytes = await resume_file.read()
        resume_filename = resume_file.filename

    resume = Resume(extension=FileExtension.PDF, file_bytes=resume_bytes)

    if call_transcript_source == CallTranscriptSourceEnum.FATHOM:
        call_transcript_text, call_transcript_title = await fathom_service.get_transcript_by_recording_id(int(call_transcript_id))
        call_transcript_filename = call_transcript_title
        call_transcript = CallTranscript(extension=FileExtension.STR, file_bytes=None, content=call_transcript_text)
    elif call_transcript_source == CallTranscriptSourceEnum.LOCAL:
        call_transcript_id = 0
        call_transcript_filename = call_transcript_file.filename
        call_transcript = CallTranscript(extension=FileExtension.PDF, file_bytes=await call_transcript_file.read(), content=None)

    response = await supabase_admin_client.table("candidates").insert({
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "linkedin_url": linkedin_url,
        "additional_info": additional_info,
        "role": role,
        "created_by": '147b07c9-9f49-4aa3-9152-b2008e3bca80',
        # Ashby Related fields below
        "user_id": response.user.id,
        "resume_filename": resume_filename,
        "resume_source": resume_source,
        "resume_handle_id": resume_handle_id,
        # Fathom Related fields below
        "call_transcript_id": call_transcript_id,
        "call_transcript_filename": call_transcript_filename,
        "call_transcript_source": call_transcript_source,
    }).execute()

    candidate_id = response.data[0]['id']
    print(f"Candidate ID router: {candidate_id}")

    process_candidate.apply_async(
        args=[int(candidate_id), resume.model_dump(), call_transcript.model_dump(), company_search_strategy, parsed_domains],
        countdown=5
    )

    return response.data[0]

@router.put("/candidates/{candidate_id}")
async def update_candidate(
    candidate_id: int, 
    first_name: str = Form(None), 
    last_name: str = Form(None), 
    email: str = Form(None), 
    linkedin_url: str = Form(None), 
    additional_info: str = Form(None), 
    resume_file: UploadFile = File(None), 
    call_transcript_file: UploadFile = File(None),
    resume_source: str = Form(None),
    resume_filename: str = Form(None),
    ashby_email: str = Form(None),
    call_transcript_source: str = Form(None),
    call_transcript_id: int = Form(None),
    extracted_data: Optional[str] = Form(None),  # Added extracted_data as a form field
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    # Get current candidate data
    candidate = await supabase_admin_client.table("candidates").select("*").eq("id", int(candidate_id)).execute()
    
    if len(candidate.data) == 0:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    current_candidate = candidate.data[0] # todo: bu candidate'i supabase_admin_client'a bağlı olarak alıyoruz.

    # Prepare update data with only provided fields
    update_data = {}
    if first_name is not None:
        update_data["first_name"] = first_name
    if last_name is not None:
        update_data["last_name"] = last_name
    if email is not None:
        update_data["email"] = email
    if linkedin_url is not None:
        update_data["linkedin_url"] = linkedin_url
    if additional_info is not None:
        update_data["additional_info"] = additional_info
    if resume_source is not None and resume_source != 'null':
        update_data["resume_source"] = resume_source
    
    if resume_file:
        is_resume_changed = (resume_file.size > 0 and resume_source == 'local') or (resume_file.size == 0 and resume_source == 'ashby' and current_candidate.get("resume_filename") != resume_filename) # resume_file always exists if it's not blinded resume information update
        is_call_transcript_changed = (call_transcript_file.size > 0 and call_transcript_source == 'local') or (call_transcript_file.size == 0 and call_transcript_source == 'fathom' and current_candidate.get("call_transcript_id") != call_transcript_id)
    else:
        is_resume_changed = False
        is_call_transcript_changed = False

    # Process files if provided
    # Resume File Change Conditions
    if is_resume_changed or is_call_transcript_changed: # size >0 olduğu için kesin değişiklik var. çünkü frontend'de input'lar update penceresinde her zaman boş olacak.
        if resume_source == 'ashby':
            resume_data, resume_handle_id = await ashby_service.get_resume_from_ashby(ashby_email)
            resume_bytes: bytes = resume_data['bytes']
            resume_filename = resume_data['filename']
            update_data["resume_filename"] = resume_filename
            update_data["resume_source"] = resume_source
            update_data["resume_handle_id"] = resume_handle_id
            resume = Resume(extension=FileExtension.PDF, file_bytes=resume_bytes)
        elif resume_source == 'local':
            resume_bytes: bytes = await resume_file.read()
            resume_filename = resume_file.filename
            update_data["resume_filename"] = resume_filename
            update_data["resume_source"] = resume_source
            update_data['resume_handle_id'] = 0
            resume = Resume(extension=FileExtension.PDF, file_bytes=resume_bytes)

        print("resume_file.size > 0 and resume_source == 'local'", resume_file.size > 0 and resume_source == 'local')
        print("resume_file.size == 0 and resume_source == 'ashby' and current_candidate.get('resume_filename') != resume_file.filename", resume_file.size == 0 and resume_source == 'ashby' and current_candidate.get('resume_filename') != resume_filename)
        print("resume_filename", resume_filename, "current_candidate.get('resume_filename')", current_candidate.get('resume_filename'), resume_filename == current_candidate.get('resume_filename'))
    
    # Call Transcript File Change Conditions
    if is_call_transcript_changed or is_resume_changed: # or is_resume_changed
        if call_transcript_source == 'fathom':
            call_transcript_text, call_transcript_title = await fathom_service.get_transcript_by_recording_id(int(call_transcript_id))
            update_data["call_transcript_filename"] = call_transcript_title
            update_data["call_transcript_source"] = call_transcript_source
            update_data["call_transcript_id"] = call_transcript_id
            call_transcript = CallTranscript(extension=FileExtension.STR, file_bytes=None, content=call_transcript_text)
        elif call_transcript_source == 'local':
            call_transcript_bytes: bytes = await call_transcript_file.read()
            call_transcript_filename = call_transcript_file.filename
            update_data["call_transcript_filename"] = call_transcript_filename # todo: bu değişiklikleri aslında burada değilde create_candidate_processing_task'ta handle etmek daha mantıklı olur.
            update_data["call_transcript_source"] = call_transcript_source
            update_data["call_transcript_id"] = 0
            call_transcript = CallTranscript(extension=FileExtension.PDF, file_bytes=call_transcript_bytes, content=None)

        print("call_transcript_file.size > 0 and call_transcript_source == 'local'", call_transcript_file.size > 0 and call_transcript_source == 'local')
        print("call_transcript_file.size == 0 and call_transcript_source == 'fathom' and current_candidate.get('call_transcript_id') != call_transcript_id", call_transcript_file.size == 0 and call_transcript_source == 'fathom' and current_candidate.get('call_transcript_id') != call_transcript_id)
    

    if is_resume_changed or is_call_transcript_changed:
        update_data["processing_status"] = ProcessingStatusEnum.EXTRACTING_CANDIDATE_DATA
        # Use default strategy and empty domains for updates since we don't have these values in update
        process_candidate.apply_async(
            args=[int(candidate_id), resume.model_dump(), call_transcript.model_dump(), "default", []],
            countdown=5
        )

    # Handle extracted_data updates only if the candidate is already processed
    if extracted_data is not None:
        if current_candidate.get("processing_status", ProcessingStatusEnum.NOT_STARTED) not in [ProcessingStatusEnum.NOT_STARTED, ProcessingStatusEnum.EXTRACTING_CANDIDATE_DATA, ProcessingStatusEnum.FAILED]:
            try:
                # Parse the JSON string to ensure it's valid
                extracted_data_dict = json.loads(extracted_data)
                update_data["extracted_data"] = extracted_data_dict
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON format for extracted_data")
        else:
            # If candidate is not processed, ignore extracted_data updates
            pass

    # Only update if there's data to update
    if update_data:
        updated_candidate = await supabase_admin_client.table("candidates").update(update_data).eq("id", int(candidate_id)).execute()

        # if update_data.get('email') is not None:
        #     supabase.auth.admin.update_user_by_id(
        #         current_candidate.get('user_id'),
        #         {
        #             "email": update_data.get('email')
        #         }
        #     )

    return updated_candidate.data[0]

@router.post("/candidates/{candidate_id}/send_magic_link")
async def send_magic_link(candidate_id: int, supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)):
    candidate = await supabase_admin_client.table("candidates").select("*").eq("id", candidate_id).execute()

    if not candidate.data:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # burada status'e göre önceden bir link gönderildiyse hata dön
    if candidate.data[0]['processing_status'] == ProcessingStatusEnum.CANDIDATE_APPROVAL_PENDING:
        raise HTTPException(status_code=400, detail="Magic link has already been sent to this candidate")

    response = await supabase_admin_client.auth.admin.generate_link(
        {
            "type": "magiclink",
            "email": candidate.data[0]['email'],
            "options": {
                "redirect_to": "https://mpc-fe-n2r5.onrender.com/auth/magic-link",
            },
        }
    )

    msg = EmailMessage()
    msg["From"] = "talent@righthandtalent.com"
    msg["To"] = candidate.data[0]['email']
    msg["Subject"] = "Your Company Matches Are Ready - Next Steps"
    msg.set_content(f"Click the link to login: {response.properties.action_link}")

    await aiosmtplib.send(
        msg,
        hostname=EMAIL_HOSTNAME,
        port=EMAIL_PORT,
        username=EMAIL_USERNAME,
        password=EMAIL_PASSWORD,
        recipients=[candidate.data[0]['email']]
    )

    await supabase_admin_client.table("candidates").update({
        "processing_status": ProcessingStatusEnum.CANDIDATE_APPROVAL_PENDING
    }).eq("id", candidate_id).execute()

    return {"message": "Magic link sent successfully"}

@router.get("/candidates/{candidate_id}/company_selections")
async def get_company_selections(candidate_id: int, supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)):
    companies_matched = await supabase_admin_client.table("candidate_company_selections_apollo").select(
        "approved_by_candidate, companies_apollo(id, name, short_description, city, state, country, industry, logo_url, website_url, founded_year, latest_funding_stage, total_funding_printed, estimated_num_employees, company_decision_makers_apollo(first_name, last_name, linkedin_url, title, email, photo_url))"
    ).eq("candidate_id", candidate_id).execute()

    return companies_matched

@router.get("/me/companies")
async def get_companies_for_candidate(
    current_user: AdminOrCandidate,
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    print(current_user['sub'])
    candidate = await supabase_admin_client.table("candidates").select("*").eq("user_id", current_user['sub']).execute()

    if len(candidate.data) == 0:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate_id = candidate.data[0]['id']
    print(type(candidate_id))
    
    # Query candidate company selections and join with companies table
    candidate_companies = await supabase_admin_client.table("candidate_company_selections_apollo").select(
        "id, candidate_id, company_id, created_at, approved_by_candidate, companies_apollo(*)"
    ).eq("candidate_id", candidate_id).execute()

    print("DATAAA", candidate_companies.data)

    # Transform the response to a cleaner format
    result = []
    for selection in candidate_companies.data:
        company_data = selection.pop("companies_apollo", {})
        result.append({
            "company_id": selection["company_id"],
            "approved_by_candidate": selection["approved_by_candidate"],
            **company_data  # Include all company information
        })

    return result

@router.post("/me/companies/approve")
async def approve_companies_for_candidate(
    current_user: AdminOrCandidate,
    selections: list[dict[str, Any]] = Body(...),
    supabase_admin_client: AsyncClient = Depends(get_supabase_admin_client)
):
    """
    Update the approval status of companies for a candidate.
    
    Args:
        candidate_id: The ID of the candidate
        selections: List of objects with company_id and approved_by_candidate fields
    """
    # Verify the candidate exists
    candidate = await supabase_admin_client.table("candidates").select("id").eq("user_id", current_user['sub']).execute()
    
    if len(candidate.data) == 0:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    candidate_id = candidate.data[0]['id']
    
    # Update each company selection
    for selection in selections:
        company_id = selection.get("company_id")
        approved = selection.get("approved_by_candidate", False)
        
        # Update the approval status
        await supabase_admin_client.table("candidate_company_selections_apollo").update({
            "approved_by_candidate": approved
        }).eq("candidate_id", candidate_id).eq("company_id", company_id).execute()
    
    await supabase_admin_client.table("candidates").update({
        "processing_status": ProcessingStatusEnum.CANDIDATE_APPROVED
    }).eq("id", candidate_id).execute()

    find_decision_makers_apollo.apply_async(
        args=[int(candidate_id)],
        countdown=5
    )
    
    return {"message": "Company approvals updated successfully"}
