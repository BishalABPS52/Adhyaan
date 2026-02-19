"""Course API endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from uuid import UUID

from app.schemas.course import (
    CourseCreate, 
    CourseUpdate, 
    CourseResponse,
    CourseBookLink,
    CourseBookLinkResponse
)
from app.db.repositories.courses import CourseRepository
from app.api.v1.admin import require_admin

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("", response_model=CourseResponse, dependencies=[Depends(require_admin)])
async def create_course(course: CourseCreate):
    """Create a new course (admin only)."""
    repo = CourseRepository()
    
    course_data = course.model_dump()
    created_course = await repo.create_course(course_data)
    
    if not created_course:
        raise HTTPException(status_code=500, detail="Failed to create course")
    
    return created_course


@router.get("", response_model=List[CourseResponse])
async def get_courses(
    level: Optional[str] = None,
    board: Optional[str] = None
):
    """Get all courses with optional filtering."""
    repo = CourseRepository()
    courses = await repo.get_all_courses(level=level, board=board)
    return courses


@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: UUID):
    """Get a course by ID."""
    repo = CourseRepository()
    course = await repo.get_course_by_id(course_id)
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return course


@router.put("/{course_id}", response_model=CourseResponse, dependencies=[Depends(require_admin)])
async def update_course(course_id: UUID, course: CourseUpdate):
    """Update a course (admin only)."""
    repo = CourseRepository()
    
    course_data = course.model_dump(exclude_unset=True)
    updated_course = await repo.update_course(course_id, course_data)
    
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return updated_course


@router.delete("/{course_id}", dependencies=[Depends(require_admin)])
async def delete_course(course_id: UUID):
    """Delete a course (admin only)."""
    repo = CourseRepository()
    success = await repo.delete_course(course_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {"message": "Course deleted successfully"}


@router.post("/{course_id}/books", response_model=CourseBookLinkResponse, dependencies=[Depends(require_admin)])
async def link_book_to_course(course_id: UUID, book_link: CourseBookLink):
    """Link a book to a course (admin only)."""
    repo = CourseRepository()
    
    book_link_data = book_link.model_dump()
    linked = await repo.link_book_to_course(course_id, book_link_data)
    
    if not linked:
        raise HTTPException(status_code=500, detail="Failed to link book to course")
    
    return linked


@router.get("/{course_id}/books")
async def get_course_books(
    course_id: UUID,
    semester: Optional[int] = None,
    year: Optional[int] = None
):
    """Get all books linked to a course."""
    repo = CourseRepository()
    books = await repo.get_course_books(course_id, semester=semester, year=year)
    return books


@router.delete("/{course_id}/books/{book_id}", dependencies=[Depends(require_admin)])
async def unlink_book_from_course(course_id: UUID, book_id: UUID):
    """Unlink a book from a course (admin only)."""
    repo = CourseRepository()
    success = await repo.unlink_book_from_course(course_id, book_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Book link not found")
    
    return {"message": "Book unlinked from course successfully"}
