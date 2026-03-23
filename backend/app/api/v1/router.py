from fastapi import APIRouter
from app.api.v1 import auth, users, books, author, admin, content, courses, student


router = APIRouter()

# Include all route modules
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(books.router, prefix="/books", tags=["Books"])
router.include_router(author.router, prefix="/author", tags=["Author"])
router.include_router(admin.router, prefix="/admin", tags=["Admin"])
router.include_router(content.router, prefix="/content", tags=["Content"])
router.include_router(courses.router, tags=["Courses"])
router.include_router(student.router, prefix="/student", tags=["Student"])



@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "message": "Adhyaan API is running"
    }
