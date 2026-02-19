from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from uuid import UUID
from app.schemas.book import (
    BookResponse, BookRatingCreate, BookType,
    AcademicBookCreate, IndieBookCreate,
    AcademicBookResponse, IndieBookResponse,
    AcademicBookUpdate, IndieBookUpdate
)
from app.schemas.user import UserResponse
from app.db.repositories.books import book_repository
from app.api.v1.auth import get_current_user, get_current_user_optional


router = APIRouter()


@router.get("/count")
async def get_total_book_count():
    """Get the total count of all published books."""
    count = book_repository.get_total_count()
    return {"count": count}


@router.get("/")
async def get_books(
    book_type: Optional[BookType] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get all published books with optional type filter."""
    books = book_repository.get_all(book_type=book_type, limit=limit, offset=offset)

    return {
        "total": len(books),
        "limit": limit,
        "offset": offset,
        "books": books
    }


@router.get("/search")
async def search_books(
    q: str = Query(..., min_length=1),
    book_type: Optional[BookType] = Query(None),
    limit: int = Query(20, ge=1, le=100)
):
    """Search books by title, author, or subject."""
    books = book_repository.search_books(query=q, book_type=book_type, limit=limit)

    return {
        "query": q,
        "total": len(books),
        "books": books
    }


@router.get("/random")
async def get_random_book():
    """Get a random book (for suggestion feature)."""
    book = book_repository.get_random_book()

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No books available"
        )

    return book


@router.get("/continue-reading")
async def get_continue_reading(
    current_user: UserResponse = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50)
):
    """Get books the user is currently reading."""
    books = book_repository.get_continue_reading(UUID(current_user.id), limit=limit)
    return {
        "total": len(books),
        "books": books
    }


@router.get("/indie")
async def get_indie_books(
    genre: Optional[str] = Query(None),
    author_name: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get indie books with optional filters."""
    books = book_repository.get_all(
        book_type=BookType.INDIE,
        limit=limit,
        offset=offset,
        genre=genre,
        author_name=author_name
    )

    return {
        "total": len(books),
        "books": books
    }


@router.get("/academic")
async def get_academic_books(
    board: Optional[str] = Query(None),
    course_name: Optional[str] = Query(None),
    subject_name: Optional[str] = Query(None),
    year: Optional[int] = Query(None),
    semester: Optional[int] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Get academic books with optional filters."""
    books = book_repository.get_all(
        book_type=BookType.ACADEMIC,
        limit=limit,
        offset=offset,
        board=board,
        course_name=course_name,
        subject_name=subject_name,
        year=year,
        semester=semester
    )

    return {
        "total": len(books),
        "books": books
    }


@router.post("/academic", status_code=status.HTTP_201_CREATED)
async def create_academic_book(
    book_data: AcademicBookCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new academic book."""
    try:
        # Extract file type from URL (assuming it's a file extension)
        file_type = book_data.file_url.split('.')[-1].lower() if '.' in book_data.file_url else 'pdf'

        book_id = book_repository.create_academic_book(
            uploaded_author_id=UUID(current_user.id),
            book_data=book_data,
            file_url=book_data.file_url,
            file_type=file_type,
            cover_image_url=book_data.cover_image_url
        )

        return {
            "message": "Academic book created successfully",
            "book_id": str(book_id)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create academic book: {str(e)}"
        )


@router.post("/indie", status_code=status.HTTP_201_CREATED)
async def create_indie_book(
    book_data: IndieBookCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new indie book."""
    try:
        # Extract file type from URL (assuming it's a file extension)
        file_type = book_data.file_url.split('.')[-1].lower() if '.' in book_data.file_url else 'pdf'

        book_id = book_repository.create_indie_book(
            uploaded_author_id=UUID(current_user.id),
            book_data=book_data,
            file_url=book_data.file_url,
            file_type=file_type,
            cover_image_url=book_data.cover_image_url
        )

        return {
            "message": "Indie book created successfully",
            "book_id": str(book_id)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create indie book: {str(e)}"
        )


@router.put("/academic/{book_id}", status_code=status.HTTP_200_OK)
async def update_academic_book(
    book_id: UUID,
    book_data: AcademicBookUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update an academic book."""
    try:
        # Check if book exists and user owns it
        book = book_repository.academic_repo.get_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Academic book not found"
            )

        # Check ownership (only uploader can update)
        if str(book.uploaded_by) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update books you uploaded"
            )

        # Update the book
        success = book_repository.academic_repo.update_book(book_id, book_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update academic book"
            )

        return {
            "message": "Academic book updated successfully",
            "book_id": str(book_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update academic book: {str(e)}"
        )


@router.put("/indie/{book_id}", status_code=status.HTTP_200_OK)
async def update_indie_book(
    book_id: UUID,
    book_data: IndieBookUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Update an indie book."""
    try:
        # Check if book exists and user owns it
        book = book_repository.indie_repo.get_by_id(book_id)
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Indie book not found"
            )

        # Check ownership (only uploader can update)
        if str(book.uploaded_by) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update books you uploaded"
            )

        # Update the book
        success = book_repository.indie_repo.update_book(book_id, book_data)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update indie book"
            )

        return {
            "message": "Indie book updated successfully",
            "book_id": str(book_id)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update indie book: {str(e)}"
        )


@router.get("/academic/filters")
async def get_academic_filters():
    """Get available filter options for academic books."""
    try:
        boards = book_repository.academic_repo.get_distinct_values('board')
        courses = book_repository.academic_repo.get_distinct_values('course_name')
        subjects = book_repository.academic_repo.get_distinct_values('subject_name')

        return {
            "boards": boards,
            "courses": courses,
            "subjects": subjects,
            "years": list(range(1, 7)),  # 1-6
            "semesters": list(range(1, 9))  # 1-8
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get academic filters: {str(e)}"
        )


@router.get("/academic/boards")
async def get_academic_boards():
    """Get all available academic boards with their types."""
    try:
        boards = book_repository.get_academic_boards()
        return {"boards": boards}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get academic boards: {str(e)}"
        )


@router.get("/academic/courses")
async def get_academic_courses(board: str = Query(..., description="Board name")):
    """Get courses available for a specific board."""
    try:
        courses = book_repository.get_academic_courses_by_board(board)
        return {"courses": courses}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get courses for board {board}: {str(e)}"
        )


@router.get("/academic/year-semester")
async def get_year_semester_options(
    board: str = Query(..., description="Board name"),
    course: str = Query(..., description="Course name")
):
    """Get year/semester options for a board and course combination."""
    try:
        options = book_repository.get_academic_year_semester_options(board, course)
        return options
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get year/semester options for {board}/{course}: {str(e)}"
        )


@router.get("/academic/subjects")
async def get_academic_subjects(
    board: str = Query(..., description="Board name"),
    course: str = Query(..., description="Course name"),
    year: Optional[int] = Query(None, description="Year/Grade"),
    semester: Optional[int] = Query(None, description="Semester"),
    part: Optional[str] = Query(None, description="Part (for university courses)")
):
    """Get subjects based on hierarchical filters."""
    try:
        subjects = book_repository.get_academic_subjects_by_filters(
            board=board, course=course, year=year, semester=semester, part=part
        )
        return {"subjects": subjects}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get subjects: {str(e)}"
        )


@router.get("/indie/filters")
async def get_indie_filters():
    """Get available filter options for indie books."""
    try:
        genres = book_repository.indie_repo.get_distinct_values('genre')
        authors = book_repository.indie_repo.get_distinct_values('author_name')

        return {
            "genres": genres,
            "authors": authors
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get indie filters: {str(e)}"
        )


@router.get("/{book_id}")
async def get_book_details(
    book_id: UUID,
    current_user: Optional[UserResponse] = Depends(get_current_user_optional)
):
    """Get detailed information about a specific book."""
    book = book_repository.get_by_id(book_id)

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    # Track reader if user is logged in
    if current_user:
        try:
            book_repository.add_reader(book_id, UUID(current_user.id))
        except Exception:
            pass  # Ignore if book_readers table doesn't exist

    # Get ratings
    try:
        ratings = book_repository.get_book_ratings(book_id, limit=5)
        ratings_breakdown = book_repository.get_ratings_breakdown(book_id)
    except Exception:
        # If ratings tables don't exist, return empty
        ratings = []
        ratings_breakdown = {}

    # Check if this user has completed the book or rated it
    user_is_completed = False
    user_rating = 0
    if current_user:
        with book_repository.db.get_cursor() as cursor:
            # Check completed status
            cursor.execute(
                "SELECT is_completed FROM book_readers WHERE book_id = %s AND user_id = %s",
                (str(book_id), str(current_user.id))
            )
            row = cursor.fetchone()
            if row:
                user_is_completed = row.get('is_completed', False)
            
            # Check rating
            cursor.execute(
                "SELECT rating FROM book_ratings WHERE book_id = %s AND user_id = %s",
                (str(book_id), str(current_user.id))
            )
            rating_row = cursor.fetchone()
            if rating_row:
                user_rating = rating_row.get('rating', 0)

    return {
        **book,
        "recent_ratings": ratings,
        "ratings_breakdown": ratings_breakdown,
        "user_is_completed": user_is_completed,
        "user_rating": user_rating
    }


@router.post("/{book_id}/rate", status_code=status.HTTP_201_CREATED)
async def rate_book(
    book_id: UUID,
    rating: int = Query(..., ge=1, le=5),
    review: Optional[str] = Query(None),
    current_user: UserResponse = Depends(get_current_user)
):
    """Rate a book."""
    book = book_repository.get_by_id(book_id)
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    rating_id = book_repository.add_rating(
        book_id=book_id,
        user_id=UUID(current_user.id),
        rating=rating,
        review=review
    )
    
    return {
        "message": "Book rated successfully",
        "rating_id": str(rating_id)
    }


@router.post("/{book_id}/mark-as-read")
async def mark_book_as_read(
    book_id: UUID,
    current_user: UserResponse = Depends(get_current_user)
):
    """Mark a book as completed by the current user."""
    success = book_repository.mark_as_completed(book_id, UUID(current_user.id))
    
    if not success:
         raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found in your reading list"
        )
        
    return {"message": "Book marked as read"}


@router.post("/{book_id}/ratings")
async def create_or_update_rating(
    book_id: UUID,
    rating_data: BookRatingCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    """Create or update a rating for a book."""
    book = book_repository.get_by_id(book_id)
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    try:
        rating_id = book_repository.add_rating(
            book_id=book_id,
            user_id=UUID(current_user.id),
            rating=rating_data.rating,
            review=rating_data.review
        )
        
        return {
            "message": "Rating submitted successfully",
            "rating_id": str(rating_id)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to submit rating: {str(e)}"
        )


@router.get("/{book_id}/ratings")
async def get_book_ratings(
    book_id: UUID,
    limit: int = Query(10, ge=1, le=50)
):
    """Get ratings for a book."""
    book = book_repository.get_by_id(book_id)
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    ratings = book_repository.get_book_ratings(book_id, limit=limit)
    ratings_breakdown = book_repository.get_ratings_breakdown(book_id)

    return {
        "book_id": str(book_id),
        "average_rating": float(book.get('rating', 0.0)),
        "total_reviews": book.get('total_reviews', 0),
        "ratings_breakdown": ratings_breakdown,
        "ratings": ratings
    }
