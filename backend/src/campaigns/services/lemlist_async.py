import httpx
from pydantic import BaseModel

class Creator(BaseModel):
    userId: str
    userEmail: str

class Sender(BaseModel):
    id: str
    email: str
    sendUserMailboxId: str

class Campaign(BaseModel):
    _id: str
    name: str
    createdAt: str
    status: str
    creator: Creator
    senders: list[Sender]

class LemListService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Content": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {self.api_key}",
        }
        self.base_url = "https://api.lemlist.com/api"

    async def get_campaign(self, campaign_id: str):

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/campaigns/{campaign_id}",
                headers=self.headers
            )

        campaign = Campaign.model_validate(response.json())
        
        return campaign
    
    async def get_campaigns(self):

        params = {
            "version": "v2"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/campaigns",
                headers=self.headers,
                params=params
            )
        
        return response.json()
    
    async def get_campaign_sequences(self, campaign_id: str):
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/campaigns/{campaign_id}/sequences",
                headers=self.headers
            )
        
        return response.json()


    async def create_campaign(self, name: str):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/campaigns",
                headers=self.headers,
                json={"name": name}
            )

        if response.status_code != 200:
            raise Exception(response.content)

        return response.json()
    
    async def create_sequence_step(self, sequence_id: str, subject: str, message: str):

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/sequences/{sequence_id}/steps",
                headers=self.headers,
                json={
                    "type": "email",
                    "subject": subject,
                    "message": message,
                    "delay": 2
                }
            )

        return response.json()
    
    async def update_sequence_step(self, sequence_id: str, step_id: str, subject: str, message: str, delay: int):

        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.base_url}/sequences/{sequence_id}/steps/{step_id}",
                headers=self.headers,
                json={
                    "type": "email",
                    "subject": subject,
                    "message": message,
                    "delay": delay
                }
            )

        return response.json()
    
    async def delete_sequence_step(self, sequence_id: str, step_id: str):

        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{self.base_url}/sequences/{sequence_id}/steps/{step_id}",
                headers=self.headers,
            )

        return response.json()
    
    async def create_lead_in_campaign(self, campaign_id: str, email: str, first_name: str, last_name: str, company_name: str, job_title: str, linkedin_url: str, company_domain: str, variables: dict):

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/campaigns/{campaign_id}/leads/{email}?deduplicate=true",
                headers=self.headers,
                json={
                    "firstName": first_name,
                    "lastName": last_name,
                    "companyName": company_name,
                    "jobTitle": job_title,
                    "linkedinUrl": linkedin_url,
                    "companyDomain": company_domain,
                    **variables
                }
            )

        if response.status_code != 200:
            raise Exception(response.content)

        return response.json()
    
    async def get_campaign_stats(self, campaign_id: str, start_date: str, end_date: str):

        params = {
            "startDate": start_date,
            "endDate": end_date
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v2/campaigns/{campaign_id}/stats",
                headers=self.headers,
                params=params
            )

        return response.json()
    
    async def get_lead_activities(self, campaign_id: str):

        params = {
            "campaignId": campaign_id,
            # "leadId": lead_id,
            "version": "v2"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/activities",
                headers=self.headers,
                params=params
            )

        return response.json()

    async def get_campaign_leads(self, campaign_id: str):

        params = {
            "state": "all",
            "format": "json"
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/campaigns/{campaign_id}/export/leads",
                headers=self.headers,
                params=params
            )

        return response.json()

    async def add_variable_to_lead(self, lead_id: str, variable_name: str, variable_value: str):

        params = {
            variable_name: variable_value
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/leads/{lead_id}/variables",
                headers=self.headers,
                params=params
            )

        return response.json()
    
    async def update_campaign_lead_variables(self, lead_id: str, variables: dict):

        params = {
            **variables
        }

        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.base_url}/leads/{lead_id}/variables",
                headers=self.headers,
                params=params
            )
        
        print(response.content)

        return response.json()

    async def pause_campaign(self, campaign_id: str):

        async with httpx.AsyncClient() as client:
            response = await client.post(
            f"{self.base_url}/campaigns/{campaign_id}/pause",
            headers=self.headers
        )
        
        if response.status_code != 200:
            raise Exception(response.content)

        return response.json()

    async def update_lead(self, campaign_id: str, lead_id: str, first_name: str, last_name: str, email_address: str):

        async with httpx.AsyncClient() as client:
            response = await client.patch(
            f"{self.base_url}/campaigns/{campaign_id}/leads/{lead_id}",
            headers=self.headers,
            json={
                "firstName": first_name,
                "lastName": last_name,
                "email": email_address
            }
        )
        
        if response.status_code != 200:
            raise Exception(response.content)

        return response.json()



    # https://api.lemlist.com/api/campaigns/:campaignId/leads/:leadId
