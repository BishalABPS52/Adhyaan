from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from app.schemas.user import UserCreate, UserLogin, UserResponse, AuthResponse, Token
from app.db.repositories.users import user_repository
from app.core.security import create_access_token
from app.services import email_service


class AuthService:
    """Service for authentication operations."""
    
    def __init__(self):
        self.user_repo = user_repository
    
    def register(self, user_data: UserCreate) -> AuthResponse:
        """
        Register a new user.
        
        Args:
            user_data: User registration data
            
        Returns:
            AuthResponse with user and token
            
        Raises:
            HTTPException: If email or username already exists
        """
        # Check if email already exists
        if self.user_repo.check_email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username already exists
        if self.user_repo.check_username_exists(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        
        # Create user with plain text password
        user_dict = self.user_repo.create(
            email=user_data.email,
            username=user_data.username,
            password=user_data.password,
            full_name=user_data.full_name,
            role=user_data.role.value
        )
        
        # Generate access token
        access_token = create_access_token(
            data={
                "sub": str(user_dict["id"]),
                "email": user_dict["email"],
                "role": user_dict["role"]
            }
        )
        
        # Send welcome email
        try:
            email_service.send_welcome_email(
                to_email=user_data.email,
                full_name=user_data.full_name or "User"
            )
        except Exception as e:
            # Log error but don't fail registration if email fails
            print(f"Failed to send welcome email: {e}")
        
        # Create response
        user_response = UserResponse(**user_dict)
        token = Token(access_token=access_token, token_type="bearer")
        
        return AuthResponse(user=user_response, token=token)
    
    def login(self, login_data: UserLogin) -> AuthResponse:
        """
        Authenticate user and generate token.
        
        Args:
            login_data: User login credentials
            
        Returns:
            AuthResponse with user and token
            
        Raises:
            HTTPException: If credentials are invalid
        """
        # Get user by email
        user = self.user_repo.get_by_email(login_data.email)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password (plain text comparison)
        if login_data.password != user["password"]:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated"
            )
        
        # Update last login
        self.user_repo.update_last_login(str(user["id"]))
        
        # Generate access token
        access_token = create_access_token(
            data={
                "sub": str(user["id"]),
                "email": user["email"],
                "role": user["role"]
            }
        )
        
        # Remove password from response
        user.pop("password", None)
        
        # Create response
        user_response = UserResponse(**user)
        token = Token(access_token=access_token, token_type="bearer")
        
        return AuthResponse(user=user_response, token=token)
    
    def get_current_user(self, user_id: str) -> Optional[UserResponse]:
        """
        Get current user by ID.
        
        Args:
            user_id: User UUID
            
        Returns:
            UserResponse or None
        """
        user = self.user_repo.get_by_id(user_id)
        if user:
            user.pop("password", None)
            return UserResponse(**user)
        return None
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email address.
        
        Args:
            email: User's email address
            
        Returns:
            User dictionary or None if not found
        """
        return self.user_repo.get_by_email(email)
    
    def email_exists(self, email: str) -> bool:
        """
        Check if email already exists in database.
        
        Args:
            email: Email address to check
            
        Returns:
            True if email exists, False otherwise
        """
        return self.user_repo.check_email_exists(email)
    
    def reset_password(self, email: str, new_password: str) -> bool:
        """
        Reset user's password.
        
        Args:
            email: User's email
            new_password: New password
            
        Returns:
            True if successful, False otherwise
        """
        try:
            return self.user_repo.update_password(email, new_password)
        except Exception:
            return False


# Global service instance
auth_service = AuthService()
