from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from uuid import UUID
from app.schemas.user import UserResponse, UserRole
from app.db.repositories.users import user_repository
from app.api.v1.auth import get_current_user


router = APIRouter()


class RoleSwitchRequest(BaseModel):
    """Request to switch user role."""
    role: UserRole


@router.post("/switch-role")
async def switch_role(
    role_data: RoleSwitchRequest,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Switch user's current role between studreader and author modes.
    All authenticated users can switch between these modes.
    """
    # Only allow switching between studreader and author roles
    if role_data.role not in [UserRole.STUDREADER, UserRole.AUTHOR]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Only studreader and author roles are allowed."
        )

    # Can't switch to admin via this endpoint
    if role_data.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot switch to admin role via this endpoint"
        )

    # Update user's current role
    success = user_repository.update_current_role(str(current_user.id), role_data.role.value)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to switch role"
        )

    return {
        "message": f"Successfully switched to {role_data.role.value} mode",
        "new_role": role_data.role.value
    }


@router.get("/featured-authors")
async def get_featured_authors(limit: int = Query(5, ge=1, le=20)):
    """Get authors who have published books."""
    authors = user_repository.get_featured_authors(limit=limit)
    return {"authors": authors}


@router.get("/profile")
async def get_user_profile(current_user: UserResponse = Depends(get_current_user)):
    """Get user profile."""
    return current_user.dict()
