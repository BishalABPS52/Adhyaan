from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.core.database import get_db_cursor
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/boards")
async def get_boards(cursor = Depends(get_db_cursor)) -> List[Dict[str, Any]]:
    """
    Get available education boards.
    For NEB, only Grade 11 and 12 content.
    """
    try:
        # Query to get distinct boards from academic_books where year is 11 or 12
        cursor.execute("""
            SELECT DISTINCT board,
                   CASE
                       WHEN board = 'NEB' THEN 'National Examination Board'
                       WHEN board = 'TU' THEN 'Tribhuvan University'
                       WHEN board = 'TU_IOE' THEN 'TU Institute of Engineering'
                       WHEN board = 'TU_IOST' THEN 'TU Institute of Science and Technology'
                       WHEN board = 'TU_IOM' THEN 'TU Institute of Medicine'
                       WHEN board = 'KU' THEN 'Kathmandu University'
                       WHEN board = 'POU' THEN 'Pokhara University'
                       WHEN board = 'PU' THEN 'Purbanchal University'
                       WHEN board = 'CTEVT' THEN 'Council for Technical Education and Vocational Training'
                       ELSE board
                   END as full_name
            FROM academic_books
            WHERE year IN (11, 12) AND is_active = TRUE
            ORDER BY board
        """)

        boards = []
        for row in cursor.fetchall():
            boards.append({
                "code": row["board"],
                "name": row["full_name"],
                "abbreviation": row["board"]
            })

        return boards

    except Exception as e:
        logger.error(f"Error fetching boards: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch boards")

@router.get("/boards/{board}/courses")
async def get_courses_for_board(board: str, cursor = Depends(get_db_cursor)) -> List[Dict[str, Any]]:
    """
    Get available courses for a specific board.
    For NEB, only show Grade 11 and 12 courses.
    """
    try:
        cursor.execute("""
            SELECT DISTINCT course_name,
                   COUNT(*) as book_count
            FROM academic_books
            WHERE board = %s AND year IN (11, 12) AND is_active = TRUE
            AND course_name IS NOT NULL
            GROUP BY course_name
            ORDER BY course_name
        """, (board,))

        courses = []
        for row in cursor.fetchall():
            courses.append({
                "name": row["course_name"],
                "book_count": row["book_count"],
                "abbreviation": "".join(word[0] for word in row["course_name"].split() if word).upper()[:3]
            })

        return courses

    except Exception as e:
        logger.error(f"Error fetching courses for board {board}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch courses")

@router.get("/boards/{board}/courses/{course}/subjects")
async def get_subjects_for_course(board: str, course: str, cursor = Depends(get_db_cursor)) -> List[Dict[str, Any]]:
    """
    Get available subjects for a specific board and course.
    """
    try:
        cursor.execute("""
            SELECT DISTINCT subject_name,
                   year,
                   semester,
                   COUNT(*) as book_count
            FROM academic_books
            WHERE board = %s AND course_name = %s AND year IN (11, 12) AND is_active = TRUE
            AND subject_name IS NOT NULL
            GROUP BY subject_name, year, semester
            ORDER BY year, semester, subject_name
        """, (board, course))

        subjects = []
        for row in cursor.fetchall():
            subjects.append({
                "name": row["subject_name"],
                "year": row["year"],
                "semester": row["semester"],
                "book_count": row["book_count"]
            })

        return subjects

    except Exception as e:
        logger.error(f"Error fetching subjects for board {board}, course {course}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch subjects")

@router.get("/boards/{board}/courses/{course}/subjects/{subject}/books")
async def get_books_for_subject(board: str, course: str, subject: str, cursor = Depends(get_db_cursor)) -> List[Dict[str, Any]]:
    """
    Get books for a specific board, course, and subject.
    """
    try:
        cursor.execute("""
            SELECT id, book_name, chapter_name, file_url, file_type, year, semester, created_at
            FROM academic_books
            WHERE board = %s AND course_name = %s AND subject_name = %s
            AND year IN (11, 12) AND is_active = TRUE
            ORDER BY year, semester, chapter_name, created_at DESC
        """, (board, course, subject))

        books = []
        for row in cursor.fetchall():
            books.append({
                "id": str(row["id"]),
                "title": row["book_name"],
                "chapter": row["chapter_name"],
                "file_url": row["file_url"],
                "file_type": row["file_type"],
                "year": row["year"],
                "semester": row["semester"],
                "uploaded_at": row["created_at"].isoformat() if row["created_at"] else None
            })

        return books

    except Exception as e:
        logger.error(f"Error fetching books for board {board}, course {course}, subject {subject}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch books")

@router.get("/boards/{board}/years")
async def get_years_for_board(board: str, cursor = Depends(get_db_cursor)) -> List[Dict[str, Any]]:
    """
    Get available years for a specific board.
    For NEB, only return 11 and 12.
    """
    try:
        cursor.execute("""
            SELECT DISTINCT year,
                   COUNT(*) as book_count
            FROM academic_books
            WHERE board = %s AND year IN (11, 12) AND is_active = TRUE
            GROUP BY year
            ORDER BY year
        """, (board,))

        years = []
        for row in cursor.fetchall():
            years.append({
                "year": row["year"],
                "book_count": row["book_count"],
                "display_name": f"Grade {row['year']}"
            })

        return years

    except Exception as e:
        logger.error(f"Error fetching years for board {board}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch years")

@router.get("/boards/{board}/years/{year}/semesters")
async def get_semesters_for_year(board: str, year: int, cursor = Depends(get_db_cursor)) -> List[Dict[str, Any]]:
    """
    Get available semesters for a specific board and year.
    """
    try:
        cursor.execute("""
            SELECT DISTINCT semester,
                   COUNT(*) as book_count
            FROM academic_books
            WHERE board = %s AND year = %s AND is_active = TRUE
            GROUP BY semester
            ORDER BY semester
        """, (board, year))

        semesters = []
        for row in cursor.fetchall():
            semesters.append({
                "semester": row["semester"],
                "book_count": row["book_count"],
                "display_name": f"Semester {row['semester']}"
            })

        return semesters

    except Exception as e:
        logger.error(f"Error fetching semesters for board {board}, year {year}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch semesters")