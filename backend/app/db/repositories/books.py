from typing import Optional, List, Dict, Any
from uuid import UUID
from app.core.database import Database
from app.schemas.book import (
    IndieBookCreate, AcademicBookCreate, BookType,
    AcademicBookUpdate, IndieBookUpdate, AcademicBookResponse, IndieBookResponse
)


class AcademicBookRepository:
    """Repository for academic book database operations using raw SQL."""

    def __init__(self):
        self.db = Database()

    def create_book(self, uploaded_author_id: UUID, book_data: AcademicBookCreate, file_type: str = 'pdf') -> UUID:
        """Create a new academic book."""
        # Normalize subject name to ensure consistency across frontend/backend
        if book_data.subject_name:
            book_data.subject_name = book_data.subject_name.strip().title()

        query = """
        INSERT INTO academic_books (
            board, book_name, course_name, course_code, level, upload_type, year, part, semester,
            subject, chapter_name, chapter_number, file_path, file_type, uploaded_author_id, cover_image_url, document_provider
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, (
                book_data.board,
                book_data.book_name,
                book_data.course_name,
                book_data.course_code,
                book_data.level.value if book_data.level else None,
                book_data.upload_type.value if book_data.upload_type else None,
                book_data.year,
                book_data.part,
                book_data.semester,
                book_data.subject_name,
                book_data.chapter_name,
                book_data.chapter_number,
                book_data.file_url,
                file_type,
                str(uploaded_author_id),
                book_data.cover_image_url,
                book_data.document_provider
            ))
            result = cursor.fetchone()
            return UUID(result['id'])

    def get_by_id(self, book_id: UUID) -> Optional[AcademicBookResponse]:
        """Get academic book by ID."""
        query = """
        SELECT b.*, u.full_name as uploaded_by_name 
        FROM academic_books b
        LEFT JOIN users u ON b.uploaded_author_id = u.id
        WHERE b.id = %s AND b.is_active = TRUE
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (str(book_id),))
            book = cursor.fetchone()
            if book:
                return self._map_to_response(book)
            return None

    def _map_to_response(self, row: dict) -> AcademicBookResponse:
        """Map DB row to AcademicBookResponse, handling column name differences."""
        return AcademicBookResponse(
            id=row['id'],
            board=row.get('board', ''),
            book_name=row.get('book_name', ''),
            course_name=row.get('course_name'),
            course_code=row.get('course_code'),
            level=row.get('level'),
            year=row.get('year'),
            part=row.get('part'),
            semester=row.get('semester'),
            subject_name=row.get('subject') or row.get('subject_name', ''),
            chapter_name=row.get('chapter_name'),
            file_url=row.get('file_path') or row.get('file_url', ''),
            file_type=row.get('file_type', 'pdf'),
            cover_image_url=row.get('cover_image_url'),
            document_provider=row.get('document_provider'),
            uploaded_by=row.get('uploaded_author_id') or row.get('uploaded_by'),
            uploaded_by_name=row.get('uploaded_by_name'),
            reader_count=row.get('reader_count', 0),
            rating=float(row.get('rating', 0.0) or 0.0),
            review_count=row.get('review_count', 0) or 0,
            is_active=row.get('is_active', True),
            created_at=row.get('created_at'),
            updated_at=row.get('updated_at'),
        )

    def get_all(
        self,
        board: Optional[str] = None,
        course_name: Optional[str] = None,
        subject_name: Optional[str] = None,
        year: Optional[int] = None,
        semester: Optional[int] = None,
        part: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[AcademicBookResponse]:
        """Get all active academic books with optional filters."""
        conditions = ["b.is_active = TRUE"]
        params = []

        if board:
            conditions.append("b.board = %s")
            params.append(board)
        if course_name:
            conditions.append("b.course_name ILIKE %s")
            params.append(f"%{course_name}%")
        if subject_name:
            conditions.append("(b.subject ILIKE %s OR b.subject_name ILIKE %s)")
            params.append(f"%{subject_name}%")
            params.append(f"%{subject_name}%")
        if year:
            conditions.append("b.year = %s")
            params.append(year)
        if semester:
            conditions.append("b.semester = %s")
            params.append(semester)
        if part:
            conditions.append("b.part = %s")
            params.append(part)

        where_clause = " AND ".join(conditions)
        query = f"""
        SELECT b.*, u.full_name as uploaded_by_name
        FROM academic_books b
        LEFT JOIN users u ON b.uploaded_author_id = u.id
        WHERE {where_clause}
        ORDER BY b.created_at DESC
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        with self.db.get_cursor() as cursor:
            cursor.execute(query, params)
            books = cursor.fetchall()
            return [self._map_to_response(book) for book in books]

    def get_by_author(self, uploaded_by: UUID, limit: int = 20, offset: int = 0) -> List[AcademicBookResponse]:
        """Get academic books by author."""
        query = """
        SELECT b.*, u.full_name as uploaded_by_name
        FROM academic_books b
        LEFT JOIN users u ON b.uploaded_author_id = u.id
        WHERE b.uploaded_author_id = %s AND b.is_active = TRUE
        ORDER BY b.created_at DESC
        LIMIT %s OFFSET %s
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (str(uploaded_by), limit, offset))
            books = cursor.fetchall()
            return [self._map_to_response(book) for book in books]

    def update_book(self, book_id: UUID, update_data: AcademicBookUpdate) -> bool:
        """Update an academic book."""
        update_fields = []
        params = []

        if update_data.board is not None:
            update_fields.append("board = %s")
            params.append(update_data.board.value)
        if update_data.book_name is not None:
            update_fields.append("book_name = %s")
            params.append(update_data.book_name)
        if update_data.course_name is not None:
            update_fields.append("course_name = %s")
            params.append(update_data.course_name)
        if update_data.course_code is not None:
            update_fields.append("course_code = %s")
            params.append(update_data.course_code)
        if update_data.year is not None:
            update_fields.append("year = %s")
            params.append(update_data.year)
        if update_data.part is not None:
            update_fields.append("part = %s")
            params.append(update_data.part)
        if update_data.semester is not None:
            update_fields.append("semester = %s")
            params.append(update_data.semester)
        if update_data.part is not None:
            update_fields.append("part = %s")
            params.append(update_data.part)
        if update_data.subject_name is not None:
            update_fields.append("subject = %s")
            params.append(update_data.subject_name)
        if update_data.chapter_name is not None:
            update_fields.append("chapter_name = %s")
            params.append(update_data.chapter_name)
        if update_data.file_url is not None:
            update_fields.append("file_path = %s")
            params.append(update_data.file_url)
        if update_data.is_active is not None:
            update_fields.append("is_active = %s")
            params.append(update_data.is_active)

        if not update_fields:
            return False

        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(str(book_id))
        query = f"UPDATE academic_books SET {', '.join(update_fields)} WHERE id = %s RETURNING id"

        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
            return result is not None

    def delete_book(self, book_id: UUID) -> bool:
        """Soft delete an academic book."""
        query = "UPDATE academic_books SET is_active = FALSE WHERE id = %s RETURNING id"
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, (str(book_id),))
            result = cursor.fetchone()
            return result is not None

    def get_distinct_values(self, field: str) -> List[str]:
        """Get distinct values for a field."""
        # Map API field names to actual DB column names
        field_map = {'subject_name': 'subject', 'file_url': 'file_path'}
        db_field = field_map.get(field, field)
        query = f"SELECT DISTINCT {db_field} FROM academic_books WHERE is_active = TRUE AND {db_field} IS NOT NULL ORDER BY {db_field}"
        with self.db.get_cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
            return [row[db_field] for row in results if row[db_field]]

    def get_boards(self) -> List[Dict[str, Any]]:
        """Get all available boards with their types from the courses table."""
        query = """
        SELECT DISTINCT board, level
        FROM courses
        WHERE is_active = TRUE
        ORDER BY board
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
            boards = []
            seen_boards = set()
            for row in results:
                board = row['board']
                if board and board not in seen_boards:
                    boards.append({"name": board, "type": row['level']})
                    seen_boards.add(board)
            return boards

    def get_courses_by_board(self, board: str) -> List[Dict[str, str]]:
        """Get courses available for a specific board from courses table."""
        query = """
        SELECT DISTINCT name, short_code as code
        FROM courses
        WHERE is_active = TRUE AND board = %s
        ORDER BY name
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (board,))
            results = cursor.fetchall()
            return [{"name": row["name"], "code": row.get("code", "")} for row in results if row["name"]]

    def get_year_semester_options(self, board: str, course: str) -> Dict[str, Any]:
        """Get year/semester options from the courses table for structure."""
        query = """
        SELECT level, total_years, total_semesters
        FROM courses
        WHERE is_active = TRUE AND board = %s AND name = %s
        LIMIT 1
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (board, course))
            row = cursor.fetchone()
            
            if not row:
                return {"type": "empty", "data": {}}

            board_type = row['level']
            total_years = row['total_years'] or 0
            total_semesters = row['total_semesters'] or 0

            if board_type == 'school':
                # For school (NEB), we use Grade 11, 12 etc.
                grades = [11, 12] if board == 'NEB' else [1, 2] # Fallback
                return {"type": "grades", "grades": grades}
            else:
                # For university, structure by Years and Semesters
                structured = {}
                for y in range(1, total_years + 1):
                    # Semesters belonging to this year
                    start_sem = (y - 1) * 2 + 1
                    year_sems = []
                    if start_sem <= total_semesters:
                        year_sems.append(start_sem)
                    if start_sem + 1 <= total_semesters:
                        year_sems.append(start_sem + 1)
                    structured[y] = {
                        "parts": ["I", "II"] if year_sems else None,
                        "semesters": year_sems if year_sems else None
                    }
                return {"type": "year_semester", "data": structured}

    def get_subjects_by_filters(self, board: str, course: str, year: Optional[int] = None,
                               semester: Optional[int] = None, part: Optional[str] = None) -> List[str]:
        """Get subjects based on board, course, and year/semester filters."""
        conditions = ["is_active = TRUE", "board = %s", "course_name = %s"]
        params = [board, course]

        if year is not None:
            conditions.append("year = %s")
            params.append(year)
        if semester is not None:
            conditions.append("semester = %s")
            params.append(semester)
        if part is not None:
            conditions.append("part = %s")
            params.append(part)

        where_clause = " AND ".join(conditions)
        query = f"""
        SELECT DISTINCT COALESCE(subject_name, subject) as subject_name
        FROM academic_books
        WHERE {where_clause} AND (subject IS NOT NULL OR subject_name IS NOT NULL)
        ORDER BY subject_name
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, params)
            results = cursor.fetchall()
            return [row["subject_name"] for row in results if row["subject_name"]]


class IndieBookRepository:
    """Repository for indie book database operations using raw SQL."""

    def __init__(self):
        self.db = Database()

    def create_book(self, uploaded_by: UUID, book_data: IndieBookCreate, file_type: str = 'pdf') -> UUID:
        """Create a new indie book."""
        query = """
        INSERT INTO indie_books (
            title, author_name, genre, published_year, publication_name,
            description, cover_image_url, file_path, file_type, uploaded_author_id
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, (
                book_data.book_name,
                book_data.author_name,
                book_data.genre,
                book_data.published_year,
                book_data.publication_name,
                book_data.description,
                book_data.cover_image_url,
                book_data.file_url,
                file_type,
                str(uploaded_by)
            ))
            result = cursor.fetchone()
            return UUID(result['id'])

    def _map_to_response(self, row: dict) -> IndieBookResponse:
        """Map DB row to IndieBookResponse."""
        return IndieBookResponse(
            id=row['id'],
            book_name=row.get('book_name') or row.get('title', ''),
            author_name=row.get('author_name'),
            genre=row.get('genre') or row.get('category'),
            published_year=row.get('published_year'),
            publication_name=row.get('publication_name'),
            description=row.get('description'),
            cover_image_url=row.get('cover_image_url'),
            file_url=row.get('file_path') or row.get('file_url', ''),
            file_type=row.get('file_type', 'pdf'),
            uploaded_by=row.get('uploaded_author_id') or row.get('uploaded_by'),
            uploaded_by_name=row.get('uploaded_by_name'),
            reader_count=row.get('reader_count', 0),
            rating=float(row.get('rating', 0.0) or 0.0),
            review_count=row.get('review_count', 0) or 0,
            is_active=row.get('is_active', True),
            created_at=row.get('created_at'),
            updated_at=row.get('updated_at'),
        )

    def get_by_id(self, book_id: UUID) -> Optional[IndieBookResponse]:
        """Get indie book by ID."""
        query = """
        SELECT b.*, u.full_name as uploaded_by_name
        FROM indie_books b
        LEFT JOIN users u ON b.uploaded_author_id = u.id
        WHERE b.id = %s AND b.is_active = TRUE
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (str(book_id),))
            book = cursor.fetchone()
            if book:
                return self._map_to_response(book)
            return None

    def get_all(
        self,
        genre: Optional[str] = None,
        author_name: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> List[IndieBookResponse]:
        """Get all active indie books with optional filters."""
        conditions = ["is_active = TRUE"]
        params = []

        if genre:
            conditions.append("genre ILIKE %s")
            params.append(f"%{genre}%")
        if author_name:
            conditions.append("author_name ILIKE %s")
            params.append(f"%{author_name}%")

        where_clause = " AND ".join(conditions)
        query = f"""
        SELECT b.*, u.full_name as uploaded_by_name
        FROM indie_books b
        LEFT JOIN users u ON b.uploaded_author_id = u.id
        WHERE {where_clause.replace('is_active', 'b.is_active')}
        ORDER BY b.created_at DESC
        LIMIT %s OFFSET %s
        """
        params.extend([limit, offset])

        with self.db.get_cursor() as cursor:
            cursor.execute(query, params)
            books = cursor.fetchall()
            return [self._map_to_response(book) for book in books]

    def get_by_author(self, uploaded_by: UUID, limit: int = 20, offset: int = 0) -> List[IndieBookResponse]:
        """Get indie books by author."""
        query = """
        SELECT b.*, u.full_name as uploaded_by_name
        FROM indie_books b
        LEFT JOIN users u ON b.uploaded_author_id = u.id
        WHERE b.uploaded_author_id = %s AND b.is_active = TRUE
        ORDER BY b.created_at DESC
        LIMIT %s OFFSET %s
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (str(uploaded_by), limit, offset))
            books = cursor.fetchall()
            return [self._map_to_response(book) for book in books]

    def update_book(self, book_id: UUID, update_data: IndieBookUpdate) -> bool:
        """Update an indie book."""
        update_fields = []
        params = []

        if update_data.book_name is not None:
            update_fields.append("book_name = %s")
            params.append(update_data.book_name)
        if update_data.author_name is not None:
            update_fields.append("author_name = %s")
            params.append(update_data.author_name)
        if update_data.genre is not None:
            update_fields.append("genre = %s")
            params.append(update_data.genre)
        if update_data.published_year is not None:
            update_fields.append("published_year = %s")
            params.append(update_data.published_year)
        if update_data.publication_name is not None:
            update_fields.append("publication_name = %s")
            params.append(update_data.publication_name)
        if update_data.description is not None:
            update_fields.append("description = %s")
            params.append(update_data.description)
        if update_data.file_url is not None:
            update_fields.append("file_path = %s")
            params.append(update_data.file_url)
        if update_data.cover_image_url is not None:
            update_fields.append("cover_image_url = %s")
            params.append(update_data.cover_image_url)
        if update_data.is_active is not None:
            update_fields.append("is_active = %s")
            params.append(update_data.is_active)

        if not update_fields:
            return False

        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(str(book_id))
        query = f"UPDATE indie_books SET {', '.join(update_fields)} WHERE id = %s RETURNING id"

        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
            return result is not None

    def delete_book(self, book_id: UUID) -> bool:
        """Soft delete an indie book."""
        query = "UPDATE indie_books SET is_active = FALSE WHERE id = %s RETURNING id"
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, (str(book_id),))
            result = cursor.fetchone()
            return result is not None

    def get_distinct_values(self, field: str) -> List[str]:
        """Get distinct values for a field."""
        query = f"SELECT DISTINCT {field} FROM indie_books WHERE is_active = TRUE AND {field} IS NOT NULL ORDER BY {field}"
        with self.db.get_cursor() as cursor:
            cursor.execute(query)
            results = cursor.fetchall()
            return [row[field] for row in results if row[field]]


class BookRepository:
    """Main repository that delegates to specific book type repositories."""

    def __init__(self):
        self.db = Database()
        self.academic_repo = AcademicBookRepository()
        self.indie_repo = IndieBookRepository()

    def create_indie_book(self, uploaded_author_id: UUID, book_data: IndieBookCreate,
                          file_url: str, file_type: str, cover_image_url: Optional[str] = None) -> UUID:
        """Create a new indie book."""
        updated = book_data.model_copy()
        updated.file_url = file_url
        updated.cover_image_url = cover_image_url
        return self.indie_repo.create_book(uploaded_author_id, updated, file_type)

    def create_academic_book(self, uploaded_author_id: UUID, book_data: AcademicBookCreate,
                             file_url: str, file_type: str, cover_image_url: Optional[str] = None) -> UUID:
        """Create a new academic book."""
        updated = book_data.model_copy()
        updated.file_url = file_url
        updated.cover_image_url = cover_image_url
        return self.academic_repo.create_book(uploaded_author_id, updated, file_type)

    def get_by_id(self, book_id: UUID) -> Optional[Dict[str, Any]]:
        """Get book by ID from either table."""
        academic = self.academic_repo.get_by_id(book_id)
        if academic:
            return academic.model_dump()
        indie = self.indie_repo.get_by_id(book_id)
        if indie:
            return indie.model_dump()
        return None

    def get_all(self, book_type: Optional[BookType] = None, limit: int = 10, offset: int = 0, **filters) -> List[Dict[str, Any]]:
        """Get all published books with pagination and optional type filter."""
        if book_type == BookType.ACADEMIC:
            books = self.academic_repo.get_all(limit=limit, offset=offset, **filters)
            return [book.model_dump() for book in books]
        elif book_type == BookType.INDIE:
            books = self.indie_repo.get_all(limit=limit, offset=offset, **filters)
            return [book.model_dump() for book in books]
        else:
            academic = self.academic_repo.get_all(limit=limit // 2 or 10, offset=offset)
            indie = self.indie_repo.get_all(limit=limit // 2 or 10, offset=offset)
            all_books = [b.model_dump() for b in academic] + [b.model_dump() for b in indie]
            all_books.sort(key=lambda x: x.get('created_at') or '', reverse=True)
            return all_books[:limit]

    def get_by_author(self, uploaded_author_id: UUID, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """Get books by author from both tables."""
        academic = self.academic_repo.get_by_author(uploaded_author_id, limit, offset)
        indie = self.indie_repo.get_by_author(uploaded_author_id, limit, offset)
        all_books = [b.model_dump() for b in academic] + [b.model_dump() for b in indie]
        all_books.sort(key=lambda x: x.get('created_at') or '', reverse=True)
        return all_books

    def update_book(self, book_id: UUID, update_data) -> bool:
        """Update a book in the appropriate table."""
        from app.schemas.book import AcademicBookUpdate, IndieBookUpdate
        try:
            if self.academic_repo.update_book(book_id, AcademicBookUpdate(**update_data.model_dump())):
                return True
        except Exception:
            pass
        try:
            return self.indie_repo.update_book(book_id, IndieBookUpdate(**update_data.model_dump()))
        except Exception:
            return False

    def delete_book(self, book_id: UUID) -> bool:
        """Delete a book from the appropriate table."""
        if self.academic_repo.delete_book(book_id):
            return True
        return self.indie_repo.delete_book(book_id)

    def add_rating(self, book_id: UUID, user_id: UUID, rating: int, review: Optional[str] = None) -> UUID:
        """Add or update a book rating, then recalculate and persist the average."""
        query = """
        INSERT INTO book_ratings (book_id, user_id, rating, review)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (book_id, user_id)
        DO UPDATE SET rating = EXCLUDED.rating, review = EXCLUDED.review, updated_at = CURRENT_TIMESTAMP
        RETURNING id
        """
        avg_query = """
        SELECT ROUND(AVG(rating)::numeric, 2) as avg_rating, COUNT(*) as review_count
        FROM book_ratings WHERE book_id = %s
        """
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, (str(book_id), str(user_id), rating, review))
            result = cursor.fetchone()
            # Recalculate aggregate
            cursor.execute(avg_query, (str(book_id),))
            agg = cursor.fetchone()
            avg_rating = float(agg['avg_rating']) if agg and agg['avg_rating'] else 0.0
            review_count = int(agg['review_count']) if agg else 0
            # Update on both tables (only one will actually match)
            cursor.execute(
                "UPDATE academic_books SET rating = %s, review_count = %s WHERE id = %s",
                (avg_rating, review_count, str(book_id))
            )
            cursor.execute(
                "UPDATE indie_books SET rating = %s, review_count = %s WHERE id = %s",
                (avg_rating, review_count, str(book_id))
            )
            return UUID(result['id'])

    def get_book_ratings(self, book_id: UUID, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent ratings for a book."""
        query = """
        SELECT r.*, u.username, u.full_name
        FROM book_ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.book_id = %s
        ORDER BY r.created_at DESC
        LIMIT %s
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (str(book_id), limit))
            return cursor.fetchall()

    def get_ratings_breakdown(self, book_id: UUID) -> Dict[int, int]:
        """Get rating distribution for a book."""
        query = """
        SELECT rating, COUNT(*) as count
        FROM book_ratings
        WHERE book_id = %s
        GROUP BY rating
        ORDER BY rating DESC
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (str(book_id),))
            results = cursor.fetchall()
            return {row['rating']: row['count'] for row in results}

    def add_reader(self, book_id: UUID, user_id: UUID) -> bool:
        """Track that a user started reading a book and update reader counts."""
        # Check if user already read this book
        check_query = "SELECT 1 FROM book_readers WHERE book_id = %s AND user_id = %s"
        
        query = """
        INSERT INTO book_readers (book_id, user_id)
        VALUES (%s, %s)
        ON CONFLICT (book_id, user_id)
        DO UPDATE SET last_read_at = CURRENT_TIMESTAMP
        RETURNING id
        """
        with self.db.get_cursor(commit=True) as cursor:
            # Check if this is a new reader for this book
            cursor.execute(check_query, (str(book_id), str(user_id)))
            is_new = cursor.fetchone() is None
            
            # Add/update entry in book_readers
            cursor.execute(query, (str(book_id), str(user_id)))
            result = cursor.fetchone()
            
            if is_new:
                # Increment reader_count in respective table
                # Try academic books
                cursor.execute("UPDATE academic_books SET reader_count = COALESCE(reader_count, 0) + 1 WHERE id = %s", (str(book_id),))
                # Try indie books
                cursor.execute("UPDATE indie_books SET reader_count = COALESCE(reader_count, 0) + 1 WHERE id = %s", (str(book_id),))
            
            return result is not None

    def mark_as_completed(self, book_id: UUID, user_id: UUID) -> bool:
        """Mark a book as completed by the user."""
        query = """
        UPDATE book_readers
        SET is_completed = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE book_id = %s AND user_id = %s
        RETURNING id
        """
        # Ensure updated_at exists or just set it if we have it
        # Actually book_readers might not have updated_at, let's just set is_completed
        query = """
        UPDATE book_readers
        SET is_completed = TRUE
        WHERE book_id = %s AND user_id = %s
        RETURNING id
        """
        with self.db.get_cursor(commit=True) as cursor:
            cursor.execute(query, (str(book_id), str(user_id)))
            result = cursor.fetchone()
            return result is not None

    def get_continue_reading(self, user_id: UUID, limit: int = 10) -> List[Dict[str, Any]]:
        """Get books the user recently read."""
        query = """
        SELECT r.book_id, r.last_read_at
        FROM book_readers r
        WHERE r.user_id = %s AND r.is_completed = FALSE
        ORDER BY r.last_read_at DESC
        LIMIT %s
        """
        with self.db.get_cursor() as cursor:
            cursor.execute(query, (str(user_id), limit))
            entries = cursor.fetchall()
            
            books = []
            for entry in entries:
                book = self.get_by_id(UUID(entry['book_id']))
                if book:
                    book['last_read_at'] = entry['last_read_at']
                    books.append(book)
            return books

    def get_author_stats(self, uploaded_author_id: UUID) -> Dict[str, Any]:
        """Get statistics for an author's books."""
        with self.db.get_cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) as count FROM academic_books WHERE uploaded_author_id = %s AND is_active = TRUE",
                (str(uploaded_author_id),)
            )
            academic_count = cursor.fetchone()['count']

            cursor.execute(
                "SELECT COUNT(*) as count FROM indie_books WHERE uploaded_author_id = %s AND is_active = TRUE",
                (str(uploaded_author_id),)
            )
            indie_count = cursor.fetchone()['count']

        return {
            'total_books': academic_count + indie_count,
            'academic_books': academic_count,
            'indie_books': indie_count,
            'total_readers': 0,
            'average_rating': 0.0,
            'total_reviews': 0
        }

    def get_top_books(self, uploaded_author_id: UUID, limit: int = 5) -> List[Dict[str, Any]]:
        """Get top books for an author."""
        return self.get_by_author(uploaded_author_id, limit=limit)

    def get_random_book(self) -> Optional[Dict[str, Any]]:
        """Get a random active book."""
        import random
        if random.choice([True, False]):
            books = self.academic_repo.get_all(limit=1)
        else:
            books = self.indie_repo.get_all(limit=1)
        if books:
            return books[0].model_dump()
        return None

    def search_books(self, query: str, book_type: Optional[BookType] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Search books by title, author name, or subject."""
        pattern = f"%{query}%"

        if book_type == BookType.ACADEMIC:
            sql = """
            SELECT * FROM academic_books
            WHERE is_active = TRUE
            AND (book_name ILIKE %s OR subject ILIKE %s OR subject_name ILIKE %s OR course_name ILIKE %s)
            ORDER BY created_at DESC LIMIT %s
            """
            with self.db.get_cursor() as cursor:
                cursor.execute(sql, (pattern, pattern, pattern, pattern, limit))
                books = cursor.fetchall()
                return [self.academic_repo._map_to_response(b).model_dump() for b in books]

        elif book_type == BookType.INDIE:
            sql = """
            SELECT * FROM indie_books
            WHERE is_active = TRUE
            AND (book_name ILIKE %s OR author_name ILIKE %s OR genre ILIKE %s OR description ILIKE %s)
            ORDER BY created_at DESC LIMIT %s
            """
            with self.db.get_cursor() as cursor:
                cursor.execute(sql, (pattern, pattern, pattern, pattern, limit))
                books = cursor.fetchall()
                return [self.indie_repo._map_to_response(b).model_dump() for b in books]

        else:
            academic = self.search_books(query, BookType.ACADEMIC, limit // 2)
            indie = self.search_books(query, BookType.INDIE, limit // 2)
            all_books = academic + indie
            all_books.sort(key=lambda x: x.get('created_at') or '', reverse=True)
            return all_books[:limit]

    def toggle_publish_status(self, book_id: UUID, new_status: bool) -> bool:
        """Toggle book active status."""
        from app.schemas.book import AcademicBookUpdate, IndieBookUpdate
        if self.academic_repo.update_book(book_id, AcademicBookUpdate(is_active=new_status)):
            return True
        return self.indie_repo.update_book(book_id, IndieBookUpdate(is_active=new_status))

    # Hierarchical filtering methods
    def get_academic_boards(self) -> List[Dict[str, Any]]:
        return self.academic_repo.get_boards()

    def get_academic_courses_by_board(self, board: str) -> List[str]:
        return self.academic_repo.get_courses_by_board(board)

    def get_academic_year_semester_options(self, board: str, course: str) -> Dict[str, Any]:
        return self.academic_repo.get_year_semester_options(board, course)

    def get_academic_subjects_by_filters(self, board: str, course: str, year: Optional[int] = None,
                                         semester: Optional[int] = None, part: Optional[str] = None) -> List[str]:
        return self.academic_repo.get_subjects_by_filters(board, course, year, semester, part)


    def get_total_count(self) -> int:
        """Get the total count of all published books."""
        with self.db.get_cursor() as cursor:
            cursor.execute("SELECT (SELECT COUNT(*) FROM academic_books WHERE is_active = TRUE) + (SELECT COUNT(*) FROM indie_books WHERE is_active = TRUE) as total")
            result = cursor.fetchone()
            return result['total'] if result else 0


book_repository = BookRepository()
