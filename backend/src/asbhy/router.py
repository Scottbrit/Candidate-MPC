from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter(tags=["Ashby"])

class AshbyCandidateSearchResponse(BaseModel):
    success: bool
    results: list[dict]

async def search_candidate_by_email(email: str):
    url = "https://api.ashbyhq.com/candidate.search"

    payload = { "email": email }
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": "Basic OTMzMjc3NDRmYmIwYWZhMjM0ZjI4Y2E1MzFjODEzYTdiNTc0YzgzMTA3Y2NhYmVjZWQzMDEzNzc4YTk4MjJhMzo="
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return AshbyCandidateSearchResponse(**response.json())


class AshbyFileInfoResponse(BaseModel):
    success: bool
    results: dict

async def get_resume_url_by_file_handle(file_handle: str):

    url = "https://api.ashbyhq.com/file.info"

    payload = { "fileHandle": file_handle }
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": "Basic OTMzMjc3NDRmYmIwYWZhMjM0ZjI4Y2E1MzFjODEzYTdiNTc0YzgzMTA3Y2NhYmVjZWQzMDEzNzc4YTk4MjJhMzo="
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return AshbyFileInfoResponse(**response.json())

async def download_resume(url: str, filename: str):

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url)
        response.raise_for_status()

        pdf_bytes = response.content

        return {
            "filename": filename,
            "size": len(pdf_bytes),
            "bytes": pdf_bytes
        }

async def get_resume_from_ashby(email: str):
    people_found = await search_candidate_by_email(email)

    if people_found.success == False or len(people_found.results) == 0:
        return None, None
    else:
        if people_found.results[0].get("resumeFileHandle") is None:
            return None, None
    
    resume_file_handle = people_found.results[0]["resumeFileHandle"]["handle"]
    resume_filename = people_found.results[0]["resumeFileHandle"]["name"]

    person_detail = await get_resume_url_by_file_handle(resume_file_handle)

    if person_detail.success == False or person_detail.results.get("url") is None:
        return None, None


    resume_data = await download_resume(person_detail.results["url"], resume_filename)

    return {"filename": resume_filename, "size": len(resume_data["bytes"])}, resume_file_handle

@router.get("/ashby/resume")
async def get_resume(
    email: str
):
    
    resume_data, resume_file_handle = await get_resume_from_ashby(email)

    if resume_data is None or resume_file_handle is None:
        raise HTTPException(status_code=404, detail="No resume found for the given email")

    return {
        "filename": resume_data['filename'],
        "size": resume_data['size'],
        "resume_file_handle": resume_file_handle
        # bytes not included in API response because it's not serializable - meaning throws error and we don't need it anyway.
    }
