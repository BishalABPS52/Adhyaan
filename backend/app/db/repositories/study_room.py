# Placeholder for study room repository (for future use)
from typing import Optional, Dict, Any
from app.core.database import db


class StudyRoomRepository:
    """Repository for study room database operations using raw SQL."""
    
    def get_by_id(self, room_id: str) -> Optional[Dict[str, Any]]:
        """Get study room by ID."""
        with db.get_cursor() as cursor:
            cursor.execute("SELECT * FROM study_rooms WHERE id = %s", (room_id,))
            result = cursor.fetchone()
            return dict(result) if result else None
    
    def get_by_join_code(self, join_code: str) -> Optional[Dict[str, Any]]:
        """Get study room by join code."""
        with db.get_cursor() as cursor:
            cursor.execute("SELECT * FROM study_rooms WHERE join_code = %s", (join_code,))
            result = cursor.fetchone()
            return dict(result) if result else None


study_room_repository = StudyRoomRepository()
