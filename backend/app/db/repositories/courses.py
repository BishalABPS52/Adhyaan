"""Course repository for database operations."""
from typing import List, Optional
from uuid import UUID
from app.core.database import Database


class CourseRepository:
    """Repository for course-related database operations."""

    def __init__(self):
        self.db = Database()

    async def create_course(self, course_data: dict) -> dict:
        """Create a new course."""
        query = """
            INSERT INTO courses (name, short_code, level, board, total_semesters, total_years, description, is_active)
            VALUES (%(name)s, %(short_code)s, %(level)s, %(board)s, %(total_semesters)s, %(total_years)s, %(description)s, %(is_active)s)
            RETURNING id, name, short_code, level, board, total_semesters, total_years, description, is_active, created_at, updated_at
        """
        
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, course_data)
            row = cursor.fetchone()
            return dict(row) if row else None

    async def get_all_courses(self, level: Optional[str] = None, board: Optional[str] = None) -> List[dict]:
        """Get all courses with optional filtering."""
        conditions = ["is_active = true"]
        params = {}
        
        if level:
            conditions.append("level = %(level)s")
            params["level"] = level
        
        if board:
            conditions.append("board = %(board)s")
            params["board"] = board
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
            SELECT id, name, short_code, level, board, total_semesters, total_years, description, is_active, created_at, updated_at
            FROM courses
            WHERE {where_clause}
            ORDER BY level, board, name
        """
        
        with self.db.get_cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    async def get_course_by_id(self, course_id: UUID) -> Optional[dict]:
        """Get a course by ID."""
        query = """
            SELECT id, name, short_code, level, board, total_semesters, total_years, description, is_active, created_at, updated_at
            FROM courses
            WHERE id = %(course_id)s
        """
        
        with self.db.get_cursor() as cursor:
            cursor.execute(query, {"course_id": str(course_id)})
            row = cursor.fetchone()
            return dict(row) if row else None

    async def update_course(self, course_id: UUID, update_data: dict) -> Optional[dict]:
        """Update a course."""
        params = {"course_id": str(course_id)}
        set_clauses = []
        
        for key, value in update_data.items():
            if value is not None:
                set_clauses.append(f"{key} = %({key})s")
                params[key] = value
        
        if not set_clauses:
            return await self.get_course_by_id(course_id)
        
        set_clauses.append("updated_at = CURRENT_TIMESTAMP")
        set_clause = ", ".join(set_clauses)
        
        query = f"""
            UPDATE courses
            SET {set_clause}
            WHERE id = %(course_id)s
            RETURNING id, name, short_code, level, board, total_semesters, total_years, description, is_active, created_at, updated_at
        """
        
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None

    async def delete_course(self, course_id: UUID) -> bool:
        """Delete a course (soft delete by setting is_active to false)."""
        query = """
            UPDATE courses
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = %(course_id)s
        """
        
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, {"course_id": str(course_id)})
            return cursor.rowcount > 0

    async def link_book_to_course(self, course_id: UUID, book_link_data: dict) -> dict:
        """Link a book to a course."""
        query = """
            INSERT INTO course_books (course_id, book_id, semester, year, part, is_required)
            VALUES (%(course_id)s, %(book_id)s, %(semester)s, %(year)s, %(part)s, %(is_required)s)
            ON CONFLICT (course_id, book_id, semester, year, part) 
            DO UPDATE SET is_required = EXCLUDED.is_required
            RETURNING id, course_id, book_id, semester, year, part, is_required, created_at
        """
        
        params = {
            "course_id": str(course_id),
            "book_id": str(book_link_data["book_id"]),
            "semester": book_link_data.get("semester"),
            "year": book_link_data.get("year"),
            "part": book_link_data.get("part"),
            "is_required": book_link_data.get("is_required", True)
        }
        
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None

    async def get_course_books(
        self, 
        course_id: UUID, 
        semester: Optional[int] = None,
        year: Optional[int] = None
    ) -> List[dict]:
        """Get all books linked to a course."""
        conditions = ["cb.course_id = %(course_id)s"]
        params = {"course_id": str(course_id)}
        
        if semester:
            conditions.append("cb.semester = %(semester)s")
            params["semester"] = semester
        
        if year:
            conditions.append("cb.year = %(year)s")
            params["year"] = year
        
        where_clause = " AND ".join(conditions)
        
        query = f"""
            SELECT b.id, b.title, b.author_name, b.book_type, b.genre, b.file_path,
                   cb.semester, cb.year, cb.part, cb.is_required
            FROM books b
            JOIN course_books cb ON b.id = cb.book_id
            WHERE {where_clause}
            ORDER BY cb.semester, cb.year, b.title
        """
        
        with self.db.get_cursor() as cursor:
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    async def unlink_book_from_course(self, course_id: UUID, book_id: UUID) -> bool:
        """Remove a book link from a course."""
        query = """
            DELETE FROM course_books
            WHERE course_id = %(course_id)s AND book_id = %(book_id)s
        """
        
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, {
                "course_id": str(course_id),
                "book_id": str(book_id)
            })
            return cursor.rowcount > 0
