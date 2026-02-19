from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Placeholder schemas for study (for future use)

class StudyBase(BaseModel):
    """Base study schema."""
    title: str
    description: Optional[str] = None


class StudyResponse(StudyBase):
    """Schema for study response."""
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True
