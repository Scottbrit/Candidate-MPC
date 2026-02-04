from pydantic import BaseModel
from enum import StrEnum

class FileExtension(StrEnum):
    TXT = "txt"
    PDF = "pdf"
    DOCX = "docx"
    STR = "str"

class Resume(BaseModel):
    extension: FileExtension
    file_bytes: bytes

class CallTranscript(BaseModel):
    extension: FileExtension
    file_bytes: bytes | None
    content: str | None

class ProcessingStatusEnum(StrEnum):
    NOT_STARTED = "not_started"
    EXTRACTING_CANDIDATE_DATA = "extracting_candidate_data"
    CANDIDATE_DATA_EXTRACTED = "candidate_data_extracted"
    SEARCHING_COMPANIES = "searching_companies"
    COMPANIES_MATCHED = "companies_matched"
    NO_COMPANIES_MATCHED = "no_companies_matched"
    CANDIDATE_APPROVAL_PENDING = "candidate_approval_pending"
    CANDIDATE_APPROVED = "candidate_approved"
    FINDING_DECISION_MAKERS = "finding_decision_makers"
    DECISION_MAKERS_FOUND = "decision_makers_found"
    NO_DECISION_MAKERS_FOUND = "no_decision_makers_found"
    FAILED = "failed"
    CAMPAIGN_CREATING = "campaign_creating"
    CAMPAIGN_CREATED = "campaign_created"

class ResumeSourceEnum(StrEnum):
    ASHBY = "ashby"
    LOCAL = "local"

class CallTranscriptSourceEnum(StrEnum):
    FATHOM = "fathom"
    LOCAL = "local"
