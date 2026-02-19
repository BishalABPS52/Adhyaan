from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Placeholder schemas for study rooms (for future use)

class StudyRoomBase(BaseModel):
    """Base study room schema."""
    name: str
    description: Optional[str] = None


class StudyRoomCreate(StudyRoomBase):
    """Schema for creating a study room."""
    max_participants: int = 50


class StudyRoomResponse(StudyRoomBase):
    """Schema for study room response."""
    id: str
    creator_id: str
    join_code: str
    is_active: bool
    max_participants: int
    current_participants: int
    created_at: datetime
    
    class Config:
        from_attributes = True
