from enum import StrEnum
from datetime import datetime
from pydantic import BaseModel, Field
from pydantic_extra_types.pendulum_dt import DateTime
from urllib.parse import urlencode
import requests


# APOLLO TASKS
class EnrichedOrganization(BaseModel):
    name: str | None = None
    short_description: str | None = None
    seo_description: str | None = None
    total_funding: int | None = None
    total_funding_printed: str | None = None
    latest_funding_round_date: DateTime | None = None
    latest_funding_stage: str | None = None
    annual_revenue: int | None = None
    annual_revenue_printed: str | None = None
    estimated_num_employees: int | None = None
    funding_events: list[dict] | None = None
    founded_year: int | None = None
    website_url: str | None = None
    linkedin_url: str | None = None
    twitter_url: str | None = None
    facebook_url: str | None = None
    crunchbase_url: str | None = None
    linkedin_uid: str | None = None
    logo_url: str | None = None
    primary_domain: str | None = None
    industry: str | None = None
    raw_address: str | None = None
    street_address: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    keywords: list[str] | None = None
    technology_names: list[str] | None = None
    departmental_head_count: dict | None = None
    apollo_id: str = Field(default=None, alias='id')
    updated_at: DateTime = datetime.now()

class CompanySearchStrategy(StrEnum):
    SMART = "default"
    HYBRID = "hybrid"
    MANUAL = "manual"

class SearchOrganizationParams(BaseModel):
    organization_locations: list[str] = Field(alias="organization_locations[]")
    q_organization_keyword_tags: list[str] = Field(alias="q_organization_keyword_tags[]")
    page: int = 1
    per_page: int = 20
    organization_latest_funding_stage_cd: list[int] = Field(alias="organization_latest_funding_stage_cd[]")

    class Config:
        validate_by_name = True

class SearchPeopleParams(BaseModel):
    person_seniorities: list[str] = Field(alias="person_seniorities[]")
    organization_ids: list[str] = Field(alias="organization_ids[]")
    per_page: int = 40

    class Config:
        validate_by_name = True

class EnrichPeopleParams(BaseModel):
    reveal_personal_emails: bool = True
    reveal_phone_number: bool = False

class EnrichedPerson(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    linkedin_url: str | None = None
    title: str | None = None
    email_status: str | None = None
    photo_url: str | None = None
    headline: str | None = None
    email: str | None = None
    organization_id: str | None = None
    employment_history: list[dict] | None = None
    seniority: str | None = None
    email_domain_catchall: bool | None = None
    apollo_id: str = Field(default=None, alias='id')

def convert_funding_stage_to_apollo(funding_stages: list):
    FUNDING_STAGE_APOLLO_MAPPING = {
        'seed': 0,
        'angel': 1,
        'venture': 10,
        'series_a': 2,
        'series_b': 3,
        'series_c': 4,
        'series_d': 5,
        'series_e': 6,
        'series_f': 7,
        'debt_financing': 13,
        'equity_crowdfunding': 14,
        'convertible_note': 15,
        'private_equity': 11,
        'other': 12
    }

    return [FUNDING_STAGE_APOLLO_MAPPING[funding_stage] for funding_stage in funding_stages if funding_stage in FUNDING_STAGE_APOLLO_MAPPING.keys()]

class ApolloService:
    def __init__(self, apollo_api_key: str):
        self.api_key = apollo_api_key
        self.headers = {
            "accept": "application/json",
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }

    def search_organizations(self, locations: list[str], keyword_tags: list[str], funding_stages: list[str], domains: list[str], company_search_strategy: str):

        print(f"Company Search Strategy: {company_search_strategy}")

        base_url = "https://api.apollo.io/api/v1/mixed_companies/search"
        
        if company_search_strategy == CompanySearchStrategy.SMART:

            if len(locations) == 1 and locations[0] == "remote":
                locations = []
            
            params = SearchOrganizationParams(
                organization_locations=locations,
                q_organization_keyword_tags=keyword_tags,
                page=1,
                per_page=20,
                organization_latest_funding_stage_cd=funding_stages
            )

            query_string = urlencode(params.model_dump(by_alias=True), doseq=True)
            url = f"{base_url}?{query_string}"
            
            try:
                response = requests.post(url, headers=self.headers)
                response.raise_for_status()
            except Exception as e:
                raise Exception(f"Failed to search organizations: {e}")

            apollo_organization_domains = [(organization['id'], organization['primary_domain']) for organization in response.json()['organizations'] if 'primary_domain' in organization]

        elif company_search_strategy == CompanySearchStrategy.HYBRID:

            if len(locations) == 1 and locations[0] == "remote":
                locations = []

            params = SearchOrganizationParams(
                organization_locations=locations,
                q_organization_keyword_tags=keyword_tags,
                page=1,
                per_page=20,
                organization_latest_funding_stage_cd=funding_stages
            )

            query_string = urlencode(params.model_dump(by_alias=True), doseq=True)
            url = f"{base_url}?{query_string}"

            try:
                response = requests.post(url, headers=self.headers)
                response.raise_for_status()
            except Exception as e:
                raise Exception(f"Failed to search organizations: {e}")

            apollo_organization_domains = [(organization['id'], organization['primary_domain']) for organization in response.json()['organizations'] if 'primary_domain' in organization]

        elif company_search_strategy == CompanySearchStrategy.MANUAL:

            apollo_organization_domains = [(None, domain) for domain in domains]

        organization_domains = list(set([(id, domain) for id, domain in apollo_organization_domains if domain]))

        return organization_domains
        
    def enrich_organizations(self, organization_domains: list[str]):

        base_url = "https://api.apollo.io/api/v1/organizations/enrich"

        enriched_organization_data = []
        for domain in organization_domains:
            params = {
            "domain": domain,
            }

            query_string = urlencode(params, doseq=True)
            url = f"{base_url}?{query_string}"

            try:
                response = requests.post(url, headers=self.headers)
                response.raise_for_status()
            except Exception as e:
                raise Exception(f"Failed to enrich organizations: {e}")

            if response.status_code == 200 and 'organization' in response.json():
                enriched_organization_data.append(EnrichedOrganization(**response.json()['organization']).model_dump(mode='json'))
        
        return enriched_organization_data
    
    def search_people_organizations(self, organization_ids: list[str]):

        base_url = "https://api.apollo.io/api/v1/mixed_people/api_search"

        params = SearchPeopleParams(
            organization_ids=organization_ids,
            person_seniorities=["owner", "founder", "c_suite"],
            per_page=40
        )

        query_string = urlencode(params.model_dump(by_alias=True), doseq=True)
        url = f"{base_url}?{query_string}"

        try:
            response = requests.post(url, headers=self.headers)
            response.raise_for_status()
        except Exception as e:
            raise Exception(f"Failed to search people: {e}")

        people_apollo_ids = [person['id'] for person in response.json()['people']]

        return people_apollo_ids
        
    def enrich_people(self, people_ids: list[str]):

        base_url = "https://api.apollo.io/api/v1/people/bulk_match"

        chunk_size = 10
        enriched_people = []

        for i in range(0, len(people_ids), chunk_size):

            params = EnrichPeopleParams(
                reveal_personal_emails=True,
                reveal_phone_number=False
            )

            payload = {
                "details": [{"id": person_apollo_id} for person_apollo_id in people_ids[i:i+chunk_size]]
            }

            query_string = urlencode(params.model_dump(), doseq=True)
            url = f"{base_url}?{query_string}"

            try:
                response = requests.post(url, headers=self.headers, json=payload)
                response.raise_for_status()
            except Exception as e:
                raise Exception(f"Failed to enrich people: {e}")

            enriched_people.extend([EnrichedPerson(**person).model_dump(mode='json') for person in response.json()['matches']])

        return enriched_people
