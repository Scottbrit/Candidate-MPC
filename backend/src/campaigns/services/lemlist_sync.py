import requests
from typing import Dict, Any


class LemListSyncService:
    """
    Synchronous LemList service for use in Celery tasks.
    Uses requests instead of httpx for synchronous HTTP calls.
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Content": "application/json",
            "Content-Type": "application/json", 
            "Authorization": f"Basic {self.api_key}",
        }
        self.base_url = "https://api.lemlist.com/api"
        self.timeout = 30

    def get_campaign(self, campaign_id: str) -> Dict[str, Any]:
        """Get campaign details."""
        response = requests.get(
            f"{self.base_url}/campaigns/{campaign_id}",
            headers=self.headers,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def get_campaigns(self) -> Dict[str, Any]:
        """Get all campaigns."""
        response = requests.get(
            f"{self.base_url}/campaigns",
            headers=self.headers,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def get_campaign_sequences(self, campaign_id: str) -> Dict[str, Any]:
        """Get campaign sequences."""
        response = requests.get(
            f"{self.base_url}/campaigns/{campaign_id}/sequences",
            headers=self.headers,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def create_campaign(self, name: str) -> Dict[str, Any]:
        """Create a new campaign."""
        response = requests.post(
            f"{self.base_url}/campaigns",
            headers=self.headers,
            json={"name": name},
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def create_sequence_step(
        self, 
        sequence_id: str, 
        subject: str, 
        message: str,
        delay: int = 1
    ) -> Dict[str, Any]:
        """Create a sequence step."""
        response = requests.post(
            f"{self.base_url}/sequences/{sequence_id}/steps",
            headers=self.headers,
            json={
                "type": "email",
                "subject": subject,
                "message": message,
                "delay": delay
            },
            timeout=self.timeout
        )
        if response.status_code != 200:
            raise Exception(f"LemList API Error: {response.status_code} - {response.text}")
        
        response.raise_for_status()
        return response.json()

    def update_sequence_step(
        self, 
        sequence_id: str, 
        step_id: str, 
        subject: str, 
        message: str, 
        delay: int
    ) -> Dict[str, Any]:
        """Update a sequence step."""
        response = requests.patch(
            f"{self.base_url}/sequences/{sequence_id}/steps/{step_id}",
            headers=self.headers,
            json={
                "type": "email",
                "subject": subject,
                "message": message,
                "delay": delay
            },
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def delete_sequence_step(self, sequence_id: str, step_id: str) -> Dict[str, Any]:
        """Delete a sequence step."""
        response = requests.delete(
            f"{self.base_url}/sequences/{sequence_id}/steps/{step_id}",
            headers=self.headers,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def create_lead_in_campaign(
        self, 
        campaign_id: str, 
        email: str, 
        first_name: str, 
        last_name: str, 
        company_name: str, 
        job_title: str, 
        linkedin_url: str, 
        company_domain: str, 
        variables: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a lead in campaign."""
        response = requests.post(
            f"{self.base_url}/campaigns/{campaign_id}/leads/{email}", # ?deduplicate=true",
            headers=self.headers,
            json={
                "firstName": first_name,
                "lastName": last_name,
                "companyName": company_name,
                "jobTitle": job_title,
                "linkedinUrl": linkedin_url,
                "companyDomain": company_domain,
                **variables
            },
            timeout=self.timeout
        )
        
        if response.status_code != 200:
            return None
            raise Exception(f"LemList API Error: {response.status_code} - {response.text} - First Name: {first_name} \n\n Last Name: {last_name} \n\n Company Name: {company_name} \n\n Job Title: {job_title} \n\n Linkedin Url: {linkedin_url} \n\n Company Domain: {company_domain} \n\n Variables: {variables}")
        
        return response.json()

    def get_campaign_stats(
        self, 
        campaign_id: str, 
        start_date: str, 
        end_date: str
    ) -> Dict[str, Any]:
        """Get campaign statistics."""
        params = {
            "startDate": start_date,
            "endDate": end_date
        }
        
        response = requests.get(
            f"{self.base_url}/v2/campaigns/{campaign_id}/stats",
            headers=self.headers,
            params=params,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def get_lead_activities(self, campaign_id: str, lead_id: str) -> Dict[str, Any]:
        """Get lead activities."""
        params = {
            "campaignId": campaign_id,
            "leadId": lead_id
        }
        
        response = requests.get(
            f"{self.base_url}/activities",
            headers=self.headers,
            params=params,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def get_campaign_leads(self, campaign_id: str) -> Dict[str, Any]:
        """Get campaign leads."""
        params = {
            "state": "all",
            "format": "json"
        }
        
        response = requests.get(
            f"{self.base_url}/campaigns/{campaign_id}/export/leads",
            headers=self.headers,
            params=params,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def add_variable_to_lead(
        self, 
        lead_id: str, 
        variable_name: str, 
        variable_value: str
    ) -> Dict[str, Any]:
        """Add variable to lead."""
        params = {
            variable_name: variable_value
        }
        
        response = requests.post(
            f"{self.base_url}/leads/{lead_id}/variables",
            headers=self.headers,
            params=params,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()
