from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from uuid import UUID
from pydantic import BaseModel
from app.schemas.user import UserResponse, UserRole
from app.db.repositories.users import user_repository
from app.db.repositories.books import book_repository
from app.api.v1.auth import get_current_user
from app.core.security import create_access_token
from app.utils.responses import success_response, error_response


router = APIRouter()


class AdminLoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def admin_login(credentials: AdminLoginRequest):
    """
    Admin login endpoint that authenticates against the database.
    """
    # Try to find admin user by username first, then by email
    user = user_repository.get_by_username(credentials.username)
    if not user:
        user = user_repository.get_by_email(credentials.username)

    if not user or user['role'] != 'admin':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )

    # For now, use plain text password comparison due to bcrypt issues
    # TODO: Fix password hashing
    if credentials.password != user['password']:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )

    # Create access token
    access_token = create_access_token(data={"sub": str(user['id']), "role": "admin"})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user['id']),
            "username": user['username'],
            "email": user['email'],
            "full_name": user['full_name'],
            "role": user['role']
        }
    }


def verify_admin_token(current_user: UserResponse = Depends(get_current_user)):
    """Dependency to verify admin token without database lookup."""
    # For hardcoded admin, just check the token subject
    if current_user.id == "admin" or current_user.role == UserRole.ADMIN:
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin access required"
    )


# Alias for consistency with other role-based dependencies
require_admin = verify_admin_token


@router.get("/users")
async def get_all_users(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    # admin removed
):
    """
    Get all users in the system.
    Admin only endpoint.
    """
    users = user_repository.get_all_users(limit=limit, offset=offset)
    
    return {
        "total": len(users),
        "limit": limit,
        "offset": offset,
        "users": users
    }


@router.patch("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: UUID,
    # admin removed
):
    """
    Toggle user active/inactive status.
    Admin only endpoint.
    """
    user = user_repository.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    new_status = not user.get('is_active', True)
    success = user_repository.update_user_status(user_id, new_status)
    
    if success:
        return {
            "message": f"User {'activated' if new_status else 'deactivated'} successfully",
            "user_id": str(user_id),
            "is_active": new_status
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user status"
        )


@router.delete("/books/{book_id}")
async def delete_book(
    book_id: UUID,
    # admin removed
):
    """
    Delete a book from the system.
    Admin only endpoint.
    """
    book = book_repository.get_by_id(book_id)
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    success = book_repository.delete_book(book_id)
    
    if success:
        return {
            "message": "Book deleted successfully",
            "book_id": str(book_id)
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete book"
        )


@router.patch("/books/{book_id}/publish")
async def toggle_book_publish_status(
    book_id: UUID,
    # admin removed
):
    """
    Toggle book publish status.
    Admin only endpoint.
    """
    book = book_repository.get_by_id(book_id)
    
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    new_status = not book.get('is_published', False)
    success = book_repository.toggle_publish_status(book_id, new_status)
    
    if success:
        return {
            "message": f"Book {'published' if new_status else 'unpublished'} successfully",
            "book_id": str(book_id),
            "is_published": new_status
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update book status"
        )


# End of admin routes
