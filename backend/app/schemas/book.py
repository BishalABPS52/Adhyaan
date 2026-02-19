from enum import Enum
from typing import Optional, List, Dict, Union, Any
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
import re

# ─── Enums ────────────────────────────────────────────────────────────────────

class EducationLevel(str, Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"
    UNDERGRADUATE = "undergraduate"
    MASTERS = "masters"
    DIPLOMA = "diploma"
    SCHOOL = "school"
    UNIVERSITY = "university"
    ENGINEERING = "engineering"
    SCIENCE = "science"
    MEDICINE = "medicine"
    GRADUATE = "graduate"
    RESEARCH = "research"

class UploadType(str, Enum):
    FULL_BOOK = "full_book"
    CHAPTER_WISE = "chapter_wise"
    QUESTION_BANK = "question_bank"

class BookType(str, Enum):
    ACADEMIC = "academic"
    INDIE = "indie"

class Board(str, Enum):
    TU = "TU"
    TU_IOE = "TU_IOE"
    TU_IOST = "TU_IOST"
    TU_IOM = "TU_IOM"
    NEB = "NEB"
    CTEVT = "CTEVT"
    KU = "KU"
    PU_POKHARA = "PU_POKHARA"
    PU_PURBANCHAL = "PU_PURBANCHAL"
    OTHERS = "Others"


# ─── Academic Book Schemas ────────────────────────────────────────────────────

class AcademicBookCreate(BaseModel):
    """Schema for creating an academic book (accepts Vercel Blob URLs)."""
    board: str = Field(..., description="Educational board")
    book_name: str = Field(..., min_length=1, max_length=500)
    course_name: Optional[str] = Field(None, max_length=255)
    level: Optional[EducationLevel] = None
    upload_type: Optional[UploadType] = UploadType.FULL_BOOK
    year: Optional[int] = Field(None, ge=1, le=20)
    part: Optional[str] = Field(None, max_length=20)
    semester: Optional[int] = Field(None, ge=1, le=20)
    subject_name: str = Field(..., min_length=1, max_length=255)
    chapter_name: Optional[str] = Field(None, max_length=255)
    chapter_number: Optional[int] = None
    document_provider: Optional[str] = Field(None, max_length=255)
    file_url: str = Field(..., description="Vercel Blob URL for the document")
    cover_image_url: Optional[str] = Field(None, description="Vercel Blob URL for cover image")

    @field_validator('file_url')
    @classmethod
    def validate_vercel_blob_url(cls, v):
        if v and not v.startswith('https://'):
            raise ValueError('file_url must be a valid https URL')
        return v

class AcademicBookUpdate(BaseModel):
    """Schema for updating academic book metadata."""
    book_name: Optional[str] = Field(None, min_length=1, max_length=500)
    course_name: Optional[str] = Field(None, max_length=255)
    year: Optional[int] = Field(None, ge=1, le=20)
    semester: Optional[int] = Field(None, ge=1, le=20)
    subject_name: Optional[str] = Field(None, min_length=1, max_length=255)
    chapter_name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = True

class AcademicBookResponse(BaseModel):
    """Response schema for academic books."""
    id: UUID
    board: str
    book_name: str
    course_name: Optional[str] = None
    level: Optional[str] = None
    year: Optional[int] = None
    part: Optional[str] = None
    semester: Optional[int] = None
    subject_name: str = ""
    chapter_name: Optional[str] = None
    file_url: str = ""
    file_type: str = "pdf"
    cover_image_url: Optional[str] = None
    document_provider: Optional[str] = None
    uploaded_by: Optional[UUID] = None
    uploaded_by_name: Optional[str] = None
    reader_count: int = 0
    rating: float = 0.0
    review_count: int = 0
    is_active: bool = True
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True


# ─── Indie Book Schemas ────────────────────────────────────────────────────────

class IndieBookCreate(BaseModel):
    """Schema for creating an indie book (accepts Vercel Blob URLs)."""
    book_name: str = Field(..., min_length=1, max_length=500)
    author_name: Optional[str] = Field(None, max_length=255)
    genre: Optional[str] = Field(None, max_length=255)
    published_year: Optional[int] = Field(None, ge=1800, le=2100)
    publication_name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    file_url: str = Field(..., description="Vercel Blob URL for the document")
    cover_image_url: Optional[str] = Field(None, description="Vercel Blob URL for cover image")

    @field_validator('file_url')
    @classmethod
    def validate_vercel_blob_url(cls, v):
        if v and not v.startswith('https://'):
            raise ValueError('file_url must be a valid https URL')
        return v

class IndieBookUpdate(BaseModel):
    book_name: Optional[str] = None
    author_name: Optional[str] = None
    genre: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True

class IndieBookResponse(BaseModel):
    id: UUID
    book_name: str
    author_name: Optional[str] = None
    genre: Optional[str] = None
    published_year: Optional[int] = None
    publication_name: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    file_url: str = ""
    file_type: str = "pdf"
    uploaded_by: Optional[UUID] = None
    uploaded_by_name: Optional[str] = None
    reader_count: int = 0
    rating: float = 0.0
    review_count: int = 0
    is_active: bool = True
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None

    class Config:
        from_attributes = True


# ─── Shared Schemas ────────────────────────────────────────────────────────────

class BookUpdate(BaseModel):
    """Unified update schema for either book type."""
    book_name: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_active: Optional[bool] = None

class BookRatingCreate(BaseModel):
    """Schema for creating a book rating."""
    rating: int = Field(..., ge=1, le=5)
    review: Optional[str] = Field(None, max_length=1000)

class BookResponse(BaseModel):
    """Union type for book responses."""
    pass

# For simpler imports in routers
BookResponse = Union[AcademicBookResponse, IndieBookResponse]

class AcademicFilters(BaseModel):
    boards: List[str]
    courses: List[str]
    types: List[str]

class IndieFilters(BaseModel):
    genres: List[str]
    authors: List[str]
