from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from uuid import UUID


class ContentType(str, Enum):
    """Type of academic content"""
    SYLLABUS = "syllabus"
    BOOK = "book"
    QUESTIONS = "questions"


class QuestionType(str, Enum):
    """Type of question"""
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"
    TRUE_FALSE = "true_false"


class Difficulty(str, Enum):
    """Question difficulty level"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


# ==================== SYLLABUS SCHEMAS ====================

class SyllabusCreate(BaseModel):
    """Schema for creating a syllabus"""
    title: str = Field(..., min_length=1, max_length=500)
    course_name: str = Field(..., min_length=1, max_length=255)
    course_code: Optional[str] = Field(None, max_length=100)
    
    # Academic metadata
    board: str = Field(..., min_length=1, max_length=100)
    class_name: str = Field(..., alias="class", min_length=1, max_length=50)
    subject: str = Field(..., min_length=1, max_length=100)
    
    # Semester/Year/Part
    semester: Optional[int] = Field(None, ge=1, le=12)
    year: Optional[int] = Field(None, ge=1, le=6)
    part: Optional[int] = Field(None, ge=1, le=4)
    
    # Content
    description: Optional[str] = None
    language: Optional[str] = Field("English", max_length=50)
    
    @validator('semester', always=True)
    def calculate_semester(cls, v, values):
        """Auto-calculate semester from year and part if not provided"""
        if v is None and 'year' in values and 'part' in values:
            year = values.get('year')
            part = values.get('part')
            if year and part:
                return (year - 1) * 2 + part
        return v

    class Config:
        populate_by_name = True


class SyllabusResponse(BaseModel):
    """Schema for syllabus response"""
    id: UUID
    author_id: UUID
    title: str
    course_name: str
    course_code: Optional[str]
    content_type: str
    
    board: str
    class_name: str = Field(..., alias="class")
    subject: str
    semester: Optional[int]
    year: Optional[int]
    part: Optional[int]
    
    description: Optional[str]
    language: Optional[str]
    file_path: Optional[str]
    
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        populate_by_name = True
        from_attributes = True


# ==================== QUESTION SCHEMAS ====================

class QuestionCreate(BaseModel):
    """Schema for creating a question"""
    book_id: UUID  # Reference to the questions book
    question_text: str = Field(..., min_length=1)
    question_type: QuestionType
    
    # MCQ specific
    options: Optional[List[str]] = None
    correct_answer: str
    
    # Metadata
    marks: int = Field(1, ge=1, le=100)
    difficulty: Optional[Difficulty] = Difficulty.MEDIUM
    explanation: Optional[str] = None

    @validator('options')
    def validate_mcq_options(cls, v, values):
        """Validate MCQ has options"""
        if values.get('question_type') == QuestionType.MCQ:
            if not v or len(v) < 2:
                raise ValueError('MCQ questions must have at least 2 options')
        return v


class QuestionUpdate(BaseModel):
    """Schema for updating a question"""
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    marks: Optional[int] = Field(None, ge=1, le=100)
    difficulty: Optional[Difficulty] = None
    explanation: Optional[str] = None


class QuestionResponse(BaseModel):
    """Schema for question response"""
    id: UUID
    book_id: UUID
    author_id: UUID
    
    question_text: str
    question_type: str
    options: Optional[List[str]]
    correct_answer: str
    
    marks: int
    difficulty: Optional[str]
    explanation: Optional[str]
    
    board: Optional[str]
    class_name: Optional[str] = Field(None, alias="class")
    subject: Optional[str]
    chapter_name: Optional[str]
    topic: Optional[str]
    
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        populate_by_name = True
        from_attributes = True


# ==================== QUESTIONS BOOK SCHEMAS ====================

class QuestionsBookCreate(BaseModel):
    """Schema for creating a questions book/bank"""
    title: str = Field(..., min_length=1, max_length=500)
    
    # Academic metadata
    board: str = Field(..., min_length=1, max_length=100)
    class_name: str = Field(..., alias="class", min_length=1, max_length=50)
    subject: str = Field(..., min_length=1, max_length=100)
    
    # Optional chapter/topic focus
    chapter_name: Optional[str] = Field(None, max_length=255)
    topic: Optional[str] = Field(None, max_length=255)
    
    # Semester/Year/Part
    semester: Optional[int] = Field(None, ge=1, le=12)
    year: Optional[int] = Field(None, ge=1, le=6)
    part: Optional[int] = Field(None, ge=1, le=4)
    
    # Content
    description: Optional[str] = None
    language: Optional[str] = Field("English", max_length=50)
    
    @validator('semester', always=True)
    def calculate_semester(cls, v, values):
        """Auto-calculate semester from year and part if not provided"""
        if v is None and 'year' in values and 'part' in values:
            year = values.get('year')
            part = values.get('part')
            if year and part:
                return (year - 1) * 2 + part
        return v

    class Config:
        populate_by_name = True


class QuestionsBookResponse(BaseModel):
    """Schema for questions book response"""
    id: UUID
    author_id: UUID
    title: str
    content_type: str
    
    board: str
    class_name: str = Field(..., alias="class")
    subject: str
    chapter_name: Optional[str]
    topic: Optional[str]
    
    semester: Optional[int]
    year: Optional[int]
    part: Optional[int]
    
    description: Optional[str]
    language: Optional[str]
    
    questions_count: int = 0
    
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        populate_by_name = True
        from_attributes = True
