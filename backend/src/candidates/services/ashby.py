import httpx
from pydantic import BaseModel

class AshbyCandidateSearchResponse(BaseModel):
    success: bool
    results: list[dict]

class AshbyFileInfoResponse(BaseModel):
    success: bool
    results: dict

class AshbyService:
    def __init__(self, ashby_api_key: str):
        self.ashby_api_key = ashby_api_key
        self.headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Basic {self.ashby_api_key}"
        }

    async def _search_people_by_email(self, email: str):
        url = "https://api.ashbyhq.com/candidate.search"

        payload = { "email": email }

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=self.headers)
            response.raise_for_status()
            return AshbyCandidateSearchResponse(**response.json())

    async def get_resume_url_by_file_handle(self, file_handle: str):

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

    async def download_resume(self, url: str, filename: str):

        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()

            pdf_bytes = response.content

            return {
                "filename": filename,
                "size": len(pdf_bytes),
                "bytes": pdf_bytes
            }


    async def get_resume_from_ashby(self, email: str):
        people_found = await self._search_people_by_email(email)

        if people_found.success == False or len(people_found.results) == 0:
            return None, None
        else:
            if people_found.results[0].get("resumeFileHandle") is None:
                return None, None
        
        resume_file_handle = people_found.results[0]["resumeFileHandle"]["handle"]
        resume_filename = people_found.results[0]["resumeFileHandle"]["name"]

        person_detail = await self.get_resume_url_by_file_handle(resume_file_handle)

        if person_detail.success == False or person_detail.results.get("url") is None:
            return None, None


        resume_data = await self.download_resume(person_detail.results["url"], resume_filename)

        return resume_data, resume_file_handle
