"""Course schemas."""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class CourseBase(BaseModel):
    """Base course schema."""
    name: str = Field(..., min_length=1, max_length=255)
    short_code: str = Field(..., min_length=1, max_length=50)
    level: str = Field(..., description="undergraduate, masters, diploma, secondary, primary")
    board: Optional[str] = Field(None, max_length=100, description="TU, KU, PU, NEB, CBSE, CTEVT")
    total_semesters: Optional[int] = Field(None, ge=1)
    total_years: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None
    is_active: bool = True


class CourseCreate(CourseBase):
    """Schema for creating a course."""
    pass


class CourseUpdate(BaseModel):
    """Schema for updating a course."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    short_code: Optional[str] = Field(None, min_length=1, max_length=50)
    level: Optional[str] = None
    board: Optional[str] = Field(None, max_length=100)
    total_semesters: Optional[int] = Field(None, ge=1)
    total_years: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    """Schema for course response."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseBookLink(BaseModel):
    """Schema for linking a book to a course."""
    book_id: UUID
    semester: Optional[int] = Field(None, ge=1)
    year: Optional[int] = Field(None, ge=1)
    part: Optional[str] = Field(None, max_length=10)
    is_required: bool = True


class CourseBookLinkResponse(CourseBookLink):
    """Response schema for course-book link."""
    id: UUID
    course_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
