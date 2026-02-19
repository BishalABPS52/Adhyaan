from fastapi import APIRouter, Depends, HTTPException, status, Query, Body, UploadFile, File, Form
from typing import Optional, List, Dict, Any
from uuid import UUID
from app.schemas.book import (
    IndieBookCreate,
    AcademicBookCreate,
    BookUpdate,
    BookType,
)
from app.schemas.user import UserResponse, UserRole
from app.db.repositories.books import book_repository
from app.api.v1.auth import get_current_user
from app.utils.vercel_blob import VercelBlobService
from app.core.config import settings

router = APIRouter()
blob_service = VercelBlobService(settings.BLOB_READ_WRITE_TOKEN)

def require_author(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    """Dependency to require author role"""
    # Assuming author_approved or role check
    if not current_user.author_approved or current_user.role != UserRole.AUTHOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only approved authors can access this resource"
        )
    return current_user

@router.post("/upload/document")
async def upload_document(
    file: UploadFile = File(...),
    folder: str = Form("academic"),
    current_user: UserResponse = Depends(require_author)
):
    """Upload a document (PDF or DOCX) to Vercel Blob and return the URL."""
    if folder not in ["academic", "indie"]:
        raise HTTPException(status_code=400, detail="Folder must be 'academic' or 'indie'")

    try:
        blob_url, file_type, file_size = await blob_service.upload_document(file=file, folder=folder)
        return {
            "success": True,
            "blob_url": blob_url,
            "file_type": file_type,
            "file_size": file_size,
            "message": "Document uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/upload/cover")
async def upload_cover_image(
    file: UploadFile = File(...),
    current_user: UserResponse = Depends(require_author)
):
    """Upload a cover image to Vercel Blob and return the URL."""
    try:
        blob_url = await blob_service.upload_cover_image(file=file)
        return {
            "success": True,
            "blob_url": blob_url,
            "message": "Cover image uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Cover upload error: {e}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/dashboard/stats")
async def get_author_dashboard_stats(
    current_user: UserResponse = Depends(require_author)
):
    """Get author dashboard statistics."""
    stats = book_repository.get_author_stats(UUID(current_user.id))
    books = book_repository.get_by_author(UUID(current_user.id), limit=10)
    top_books = book_repository.get_top_books(UUID(current_user.id), limit=5)

    return {
        "total_books": stats['total_books'],
        "academic_books": stats['academic_books'],
        "indie_books": stats['indie_books'],
        "total_readers": stats.get('total_readers', 0),
        "average_rating": stats.get('average_rating', 0.0),
        "total_reviews": stats.get('total_reviews', 0),
        "recent_books": books,
        "top_rated_books": top_books
    }

@router.post("/academic", status_code=status.HTTP_201_CREATED)
async def create_academic_book(
    book_data: AcademicBookCreate,
    current_user: UserResponse = Depends(require_author)
):
    """Create a new academic book."""
    try:
        # Extract file type from URL
        file_type = book_data.file_url.split('.')[-1].lower() if '.' in book_data.file_url else 'pdf'
        
        book_id = book_repository.create_academic_book(
            uploaded_author_id=UUID(current_user.id),
            book_data=book_data,
            file_url=book_data.file_url,
            file_type=file_type,
            cover_image_url=book_data.cover_image_url
        )
        
        return {
            "success": True,
            "message": "Academic book created successfully",
            "book_id": str(book_id)
        }
    except Exception as e:
        print(f"Create academic book error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create academic book: {str(e)}")

@router.post("/indie", status_code=status.HTTP_201_CREATED)
async def create_indie_book(
    book_data: IndieBookCreate,
    current_user: UserResponse = Depends(require_author)
):
    """Create a new indie book."""
    try:
        # Get file type and size from URL or assuming PDF
        file_type = book_data.file_url.split('.')[-1].lower() if '.' in book_data.file_url else 'pdf'
        
        book_id = book_repository.create_indie_book(
            uploaded_author_id=UUID(current_user.id),
            book_data=book_data,
            file_url=book_data.file_url,
            file_type=file_type,
            cover_image_url=book_data.cover_image_url
        )
        
        return {
            "success": True,
            "message": "Indie book created successfully",
            "book_id": str(book_id)
        }
    except Exception as e:
        print(f"Create indie book error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to create indie book: {str(e)}")

@router.delete("/{book_id}")
async def delete_book(
    book_id: UUID,
    current_user: UserResponse = Depends(require_author)
):
    """Delete a book."""
    # Verify ownership
    book = book_repository.get_by_id(book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if the author ID matches
    # Note: book is mapped to dict in get_by_id
    uploaded_by = book.get('uploaded_by') or book.get('uploaded_author_id')
    if str(uploaded_by) != str(current_user.id):
         raise HTTPException(status_code=403, detail="You do not have permission to delete this book")
    
    success = book_repository.delete_book(book_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete book")
    
    return {"success": True, "message": "Book deleted successfully"}
