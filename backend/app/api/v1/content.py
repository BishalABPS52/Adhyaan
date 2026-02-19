from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import Optional, List
from uuid import UUID
import os
from app.schemas.content import (
    SyllabusCreate, SyllabusResponse,
    QuestionsBookCreate, QuestionsBookResponse,
    QuestionCreate, QuestionResponse, QuestionUpdate,
    ContentType
)
from app.schemas.user import UserResponse
from app.db.repositories.content import content_repository
from app.api.v1.auth import get_current_user
from app.core.config import settings
from app.utils.file_upload import FileUploadHandler


router = APIRouter()
file_handler = FileUploadHandler()


def require_author(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to require author role"""
    if not current_user.author_approved or current_user.current_role != 'author':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved authors can access this resource"
        )
    return current_user


# ==================== SYLLABUS ENDPOINTS ====================

@router.post("/syllabus", response_model=SyllabusResponse)
async def upload_syllabus(
    title: str = Form(...),
    course_name: str = Form(...),
    course_code: Optional[str] = Form(None),
    board: str = Form(...),
    class_name: str = Form(..., alias="class"),
    subject: str = Form(...),
    semester: Optional[int] = Form(None),
    year: Optional[int] = Form(None),
    part: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    language: Optional[str] = Form("English"),
    file: Optional[UploadFile] = File(None),
    current_user: UserResponse = Depends(require_author)
):
    """Upload a course syllabus"""
    
    # Save file if provided
    file_path = None
    if file:
        file_path = await file_handler.save_file(file, "syllabus")
    
    syllabus_data = {
        "title": title,
        "course_name": course_name,
        "course_code": course_code,
        "board": board,
        "class": class_name,
        "subject": subject,
        "semester": semester,
        "year": year,
        "part": part,
        "description": description,
        "language": language
    }
    
    # Auto-calculate semester if not provided
    if semester is None and year and part:
        syllabus_data["semester"] = (year - 1) * 2 + part
    
    syllabus = content_repository.create_syllabus(
        author_id=current_user.id,
        syllabus_data=syllabus_data,
        file_path=file_path
    )
    
    if not syllabus:
        # Cleanup uploaded file if creation failed
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create syllabus"
        )
    
    return syllabus


@router.get("/syllabus/my", response_model=List[SyllabusResponse])
async def get_my_syllabi(
    current_user: UserResponse = Depends(require_author)
):
    """Get all syllabi created by the current author"""
    syllabi = content_repository.get_syllabi_by_author(current_user.id)
    return syllabi


@router.get("/syllabus/course", response_model=List[SyllabusResponse])
async def get_syllabi_by_course(
    board: str,
    class_name: str,
    subject: str,
    semester: Optional[int] = None
):
    """Get syllabi for a specific course (public endpoint)"""
    syllabi = content_repository.get_syllabi_by_course(board, class_name, subject, semester)
    return syllabi


@router.delete("/syllabus/{syllabus_id}")
async def delete_syllabus(
    syllabus_id: UUID,
    current_user: UserResponse = Depends(require_author)
):
    """Delete a syllabus"""
    success = content_repository.delete_content(syllabus_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Syllabus not found or you don't have permission to delete it"
        )
    
    return {"message": "Syllabus deleted successfully"}


# ==================== QUESTIONS BOOK ENDPOINTS ====================

@router.post("/questions-book", response_model=QuestionsBookResponse)
async def create_questions_book(
    title: str = Form(...),
    board: str = Form(...),
    class_name: str = Form(..., alias="class"),
    subject: str = Form(...),
    chapter_name: Optional[str] = Form(None),
    topic: Optional[str] = Form(None),
    semester: Optional[int] = Form(None),
    year: Optional[int] = Form(None),
    part: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    language: Optional[str] = Form("English"),
    current_user: UserResponse = Depends(require_author)
):
    """Create a new questions book/bank"""
    
    book_data = {
        "title": title,
        "board": board,
        "class": class_name,
        "subject": subject,
        "chapter_name": chapter_name,
        "topic": topic,
        "semester": semester,
        "year": year,
        "part": part,
        "description": description,
        "language": language
    }
    
    # Auto-calculate semester if not provided
    if semester is None and year and part:
        book_data["semester"] = (year - 1) * 2 + part
    
    questions_book = content_repository.create_questions_book(
        author_id=current_user.id,
        book_data=book_data
    )
    
    if not questions_book:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create questions book"
        )
    
    questions_book['questions_count'] = 0
    return questions_book


@router.get("/questions-book/my", response_model=List[QuestionsBookResponse])
async def get_my_questions_books(
    current_user: UserResponse = Depends(require_author)
):
    """Get all questions books created by the current author"""
    books = content_repository.get_questions_books_by_author(current_user.id)
    return books


@router.delete("/questions-book/{book_id}")
async def delete_questions_book(
    book_id: UUID,
    current_user: UserResponse = Depends(require_author)
):
    """Delete a questions book and all its questions"""
    success = content_repository.delete_content(book_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Questions book not found or you don't have permission to delete it"
        )
    
    return {"message": "Questions book deleted successfully"}


# ==================== QUESTION ENDPOINTS ====================

@router.post("/questions", response_model=QuestionResponse)
async def create_question(
    question: QuestionCreate,
    current_user: UserResponse = Depends(require_author)
):
    """Create a new question in a questions book"""
    
    question_data = question.dict()
    question_data['author_id'] = current_user.id
    
    try:
        created_question = content_repository.create_question(question_data)
        
        if not created_question:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create question"
            )
        
        return created_question
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/questions/book/{book_id}", response_model=List[QuestionResponse])
async def get_questions_by_book(
    book_id: UUID,
    limit: int = 100
):
    """Get all questions for a specific questions book"""
    questions = content_repository.get_questions_by_book(book_id, limit)
    return questions


@router.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: UUID,
    question_update: QuestionUpdate,
    current_user: UserResponse = Depends(require_author)
):
    """Update a question"""
    
    update_data = question_update.dict(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    updated_question = content_repository.update_question(question_id, update_data)
    
    if not updated_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return updated_question


@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: UUID,
    current_user: UserResponse = Depends(require_author)
):
    """Delete a question"""
    success = content_repository.delete_question(question_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found or you don't have permission to delete it"
        )
    
    return {"message": "Question deleted successfully"}


# ==================== DASHBOARD STATS ====================

@router.get("/dashboard/stats")
async def get_content_stats(
    current_user: UserResponse = Depends(require_author)
):
    """Get content statistics for author dashboard"""
    
    syllabi = content_repository.get_syllabi_by_author(current_user.id)
    questions_books = content_repository.get_questions_books_by_author(current_user.id)
    
    total_questions = sum(book.get('questions_count', 0) for book in questions_books)
    
    return {
        "syllabi_count": len(syllabi),
        "questions_books_count": len(questions_books),
        "total_questions": total_questions
    }
