from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.schemas.user import UserCreate, UserLogin, AuthResponse, UserResponse
from app.services.auth_service import auth_service
from app.core.security import decode_access_token
from app.services import email_service


router = APIRouter()
security = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserResponse:
    """Dependency to get current authenticated user."""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = auth_service.get_current_user(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user


def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[UserResponse]:
    """Dependency to get current user if authenticated, None otherwise."""
    if not credentials:
        return None
    
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


class VerificationRequest(BaseModel):
    """Request model for sending verification code."""
    email: EmailStr
    full_name: str


class VerifyCodeRequest(BaseModel):
    """Request model for verifying code."""
    email: EmailStr
    code: str


class CheckEmailRequest(BaseModel):
    """Request model for checking if email exists."""
    email: EmailStr


@router.post("/send-verification")
async def send_verification_code(request: VerificationRequest):
    """
    Send verification code to email.
    
    - **email**: Email address to send code to
    - **full_name**: User's full name for personalization
    """
    # Generate and store code
    code = email_service.generate_verification_code()
    email_service.store_verification_code(request.email, code)
    
    # Send email
    success = email_service.send_verification_email(
        request.email, 
        code, 
        request.full_name
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please check email configuration."
        )
    
    return {
        "message": "Verification code sent successfully",
        "email": request.email
    }


@router.post("/verify-code")
async def verify_code(request: VerifyCodeRequest):
    """
    Verify the code sent to email.
    
    - **email**: Email address
    - **code**: 6-digit verification code
    """
    is_valid = email_service.verify_code(request.email, request.code)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    return {
        "message": "Verification successful",
        "verified": True
    }


@router.post("/resend-verification")
async def resend_verification_code(request: VerificationRequest):
    """
    Resend verification code to email.
    
    - **email**: Email address
    - **full_name**: User's full name
    """
    code = email_service.resend_verification_code(request.email, request.full_name)
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resend verification code"
        )
    
    return {
        "message": "Verification code resent successfully",
        "email": request.email
    }


@router.post("/check-email")
async def check_email(request: CheckEmailRequest):
    """
    Check if email already exists in the database.
    
    - **email**: Email address to check
    
    Returns whether the email exists.
    """
    exists = auth_service.email_exists(request.email)
    return {
        "email": request.email,
        "exists": exists
    }


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user.
    
    - **email**: Valid email address
    - **username**: Unique username (3-100 characters, alphanumeric)
    - **password**: Strong password (min 8 characters, must contain letters and digits)
    - **full_name**: Optional full name
    - **role**: User role (student, author, admin) - defaults to student
    
    Returns user data and JWT access token.
    """
    return auth_service.register(user_data)


@router.post("/login", response_model=AuthResponse)
async def login(login_data: UserLogin):
    """
    Authenticate user 
    
    - **email**: User's email address
    - **password**: User's password
    
    """
    return auth_service.login(login_data)


@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(current_user: UserResponse = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Requires Bearer token in Authorization header.
    """
    return current_user


@router.post("/logout")
async def logout():
    """
    Logout user (client-side token removal).
    
    Note: JWT tokens are stateless. Actual logout should be handled 
    on the client side by removing the token.
    """
    return {"message": "Successfully logged out. Please remove the token from client."}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyResetCodeRequest(BaseModel):
    email: EmailStr
    code: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Send password reset code to user's email."""
    try:
        print(f"Forgot password request for email: {request.email}")
        
        # Check if user exists
        user = auth_service.get_user_by_email(request.email)
        print(f"User found: {user is not None}")
        
        if not user:
            # Don't reveal if email exists or not for security
            return {"message": "If the email exists, a reset code has been sent."}
        
        # Generate reset code (6 digits)
        import random
        reset_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        print(f"Generated reset code: {reset_code}")
        
        # Store reset code using email service
        email_service.store_verification_code(request.email, reset_code, expires_minutes=10)
        print("Reset code stored")
        
        # Send email
        print("Attempting to send email...")
        success = await email_service.send_password_reset_email(request.email, reset_code)
        print(f"Email send result: {success}")
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send reset email"
            )
        
        return {"message": "If the email exists, a reset code has been sent."}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in forgot password: {e}")
        # Don't reveal errors for security
        return {"message": "If the email exists, a reset code has been sent."}


@router.post("/verify-reset-code")
async def verify_reset_code(request: VerifyResetCodeRequest):
    """Verify the reset code."""
    if email_service.verify_code(request.email, request.code, consume=False):
        return {"message": "Code verified successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code"
        )


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset user's password."""
    try:
        # Verify code first
        if not email_service.verify_code(request.email, request.code, consume=True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset code"
            )
        
        # Reset password
        success = auth_service.reset_password(request.email, request.new_password)
        if success:
            # Clear the verification code after successful reset (already done by verify_code)
            return {"message": "Password reset successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to reset password"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to reset password: {str(e)}"
        )
