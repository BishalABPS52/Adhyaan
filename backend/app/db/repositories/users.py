from typing import Optional, Dict, Any
from psycopg2.extras import RealDictRow
from app.core.database import db


class UserRepository:
    """Repository for user database operations using raw SQL."""
    
    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user by ID.
        
        Args:
            user_id: User UUID
            
        Returns:
            User dictionary or None if not found
        """
        with db.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id, email, username, password, full_name, 
                    role, is_active, is_verified, author_approved, created_at, updated_at, 
                    last_login, profile_image_url, bio
                FROM users 
                WHERE id = %s
            """, (user_id,))
            result = cursor.fetchone()
            return dict(result) if result else None
    
    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """
        Get user by email.
        
        Args:
            email: User email address
            
        Returns:
            User dictionary or None if not found
        """
        with db.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id, email, username, password, full_name, 
                    role, is_active, is_verified, author_approved, created_at, updated_at, 
                    last_login, profile_image_url, bio
                FROM users 
                WHERE LOWER(email) = LOWER(%s)
            """, (email,))
            result = cursor.fetchone()
            return dict(result) if result else None
    
    def get_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """
        Get user by username.
        
        Args:
            username: Username
            
        Returns:
            User dictionary or None if not found
        """
        with db.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id, email, username, password, full_name, 
                    role, is_active, is_verified, author_approved, created_at, updated_at, 
                    last_login, profile_image_url, bio
                FROM users 
                WHERE username = %s
            """, (username,))
            result = cursor.fetchone()
            return dict(result) if result else None
    
    def create(self, email: str, username: str, password: str, 
               full_name: Optional[str] = None, role: str = "student") -> Dict[str, Any]:
        """
        Create a new user.
        
        Args:
            email: User email
            username: Username
            password: Plain text password
            full_name: User's full name
            role: User role (student, author, admin)
            
        Returns:
            Created user dictionary
        """
        with db.get_cursor(commit=True) as cursor:
            cursor.execute("""
                INSERT INTO users (email, username, password, full_name, role)
                VALUES (LOWER(%s), %s, %s, %s, %s)
                RETURNING id, email, username, full_name, role, is_active, is_verified, author_approved, created_at
            """, (email, username, password, full_name, role))
            result = cursor.fetchone()
            return dict(result)
    
    def update(self, user_id: str, **kwargs) -> Optional[Dict[str, Any]]:
        """
        Update user details.
        
        Args:
            user_id: User UUID
            **kwargs: Fields to update (full_name, profile_image_url, bio)
            
        Returns:
            Updated user dictionary or None if not found
        """
        # Build dynamic update query
        update_fields = []
        values = []
        
        for field in ['full_name', 'profile_image_url', 'bio']:
            if field in kwargs and kwargs[field] is not None:
                update_fields.append(f"{field} = %s")
                values.append(kwargs[field])
        
        if not update_fields:
            return self.get_by_id(user_id)
        
        values.append(user_id)
        
        with db.get_cursor(commit=True) as cursor:
            query = f"""
                UPDATE users
                SET {', '.join(update_fields)}, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, email, username, full_name, role, is_active, is_verified, 
                          author_approved, created_at, updated_at, profile_image_url, bio
            """
            cursor.execute(query, values)
            result = cursor.fetchone()
            return dict(result) if result else None
    
    def update_last_login(self, user_id: str) -> None:
        """
        Update user's last login timestamp.
        
        Args:
            user_id: User UUID
        """
        with db.get_cursor(commit=True) as cursor:
            cursor.execute("""
                UPDATE users
                SET last_login = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (user_id,))
    
    def check_email_exists(self, email: str) -> bool:
        """
        Check if email already exists.
        
        Args:
            email: Email to check
            
        Returns:
            True if exists, False otherwise
        """
        with db.get_cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS(SELECT 1 FROM users WHERE LOWER(email) = LOWER(%s)) as exists
            """, (email,))
            result = cursor.fetchone()
            return result['exists'] if result else False
    
    def check_username_exists(self, username: str) -> bool:
        """
        Check if username already exists.
        
        Args:
            username: Username to check
            
        Returns:
            True if exists, False otherwise
        """
        with db.get_cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS(SELECT 1 FROM users WHERE username = %s) as exists
            """, (username,))
            result = cursor.fetchone()
            return result['exists'] if result else False
    
    def update_current_role(self, user_id: str, role: str) -> bool:
        """
        Update user's current role.
        
        Args:
            user_id: User UUID
            role: New role value
            
        Returns:
            True if updated, False otherwise
        """
        with db.get_cursor(commit=True) as cursor:
            cursor.execute("""
                UPDATE users
                SET current_role = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id
            """, (role, user_id))
            result = cursor.fetchone()
            return result is not None
    
    def get_all_users(self, limit: int = 100, offset: int = 0):
        """
        Get all users with pagination.
        
        Args:
            limit: Maximum number of users to return
            offset: Number of users to skip
            
        Returns:
            List of user dictionaries
        """
        with db.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    id, email, username, full_name, 
                    role, is_active, is_verified, created_at, updated_at, 
                    last_login
                FROM users 
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """, (limit, offset))
            results = cursor.fetchall()
            return [dict(row) for row in results]
    
    def update_user_status(self, user_id: str, is_active: bool) -> bool:
        """
        Update user's active status.
        
        Args:
            user_id: User UUID
            is_active: New active status
            
        Returns:
            True if updated, False otherwise
        """
        with db.get_cursor(commit=True) as cursor:
            cursor.execute("""
                UPDATE users
                SET is_active = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id
            """, (is_active, user_id))
            result = cursor.fetchone()
            return result is not None
    
    def update_password(self, email: str, new_password: str) -> bool:
        """
        Update user's password.
        
        Args:
            email: User email
            new_password: New password (plain text)
            
        Returns:
            True if updated, False otherwise
        """
        with db.get_cursor(commit=True) as cursor:
            cursor.execute("""
                UPDATE users
                SET password = %s, updated_at = CURRENT_TIMESTAMP
                WHERE LOWER(email) = LOWER(%s)
                RETURNING id
            """, (new_password, email))
            result = cursor.fetchone()
            return result is not None

    def get_featured_authors(self, limit: int = 5):
        """
        Get authors from the authors table.
        Featured authors are those in the authors table who have books mentioned.
        """
        with db.get_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    a.id, a.name as full_name, a.profile_image_url, a.bio,
                    (SELECT COUNT(*) FROM indie_books WHERE author_name = a.name) as book_count
                FROM authors a
                ORDER BY a.is_featured DESC, book_count DESC
                LIMIT %s
            """, (limit,))
            results = cursor.fetchall()
            return [dict(row) for row in results]


# Global repository instance
user_repository = UserRepository()
