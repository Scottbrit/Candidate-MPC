from pydantic import BaseModel
from enum import StrEnum

class CampaignCreate(BaseModel):
    name: str

class CampaignStepCreate(BaseModel):
    subject: str
    message: str

class CampaignStats(StrEnum):
    PROCESSING = "processing"
    DRAFT = "draft"
    RUNNING = "running"
    PAUSED = "paused"
    ENDED = "ended"
    ARCHIVED = "archived"
    ERRORS = "errors"
