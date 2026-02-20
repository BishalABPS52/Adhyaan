import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import Generator
from app.core.config import settings


class Database:
    """PostgreSQL database connection manager."""
    
    def __init__(self):
        # Default connection parameters
        self.connection_params = {
            'host': settings.DATABASE_HOST,
            'port': settings.DATABASE_PORT,
            'database': settings.DATABASE_NAME,
            'user': settings.DATABASE_USER,
            'password': settings.DATABASE_PASSWORD,
            'sslmode': 'require',
        }
        
        # Resolve host to IPv4 to prevent IPv6 connection issues (common with Supabase)
        try:
            import socket
            host_ip = socket.gethostbyname(settings.DATABASE_HOST)
            self.connection_params['host'] = host_ip
        except Exception as e:
            print(f"Warning: Could not resolve IPv4 for database host: {e}")
    
    def get_connection(self):
        """Get a new database connection."""
        return psycopg2.connect(**self.connection_params)
    
    @contextmanager
    def get_cursor(self, commit: bool = False) -> Generator:
        """
        Context manager for database operations.
        
        Args:
            commit: Whether to commit the transaction on success
            
        Yields:
            Database cursor with RealDictCursor (returns dict-like rows)
        """
        conn = self.get_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            yield cursor
            if commit:
                conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()


# Global database instance
db = Database()


def get_db_cursor(commit: bool = False):
    """
    Dependency for getting database cursor in API routes.
    
    Usage:
        @router.get("/users")
        def get_users(cursor = Depends(get_db_cursor)):
            cursor.execute("SELECT * FROM users")
            return cursor.fetchall()
    """
    with db.get_cursor(commit=commit) as cursor:
        yield cursor
