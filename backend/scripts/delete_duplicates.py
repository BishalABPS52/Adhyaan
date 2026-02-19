
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DATABASE_HOST", "localhost"),
        port=os.getenv("DATABASE_PORT", "5432"),
        database=os.getenv("DATABASE_NAME", "adhyaan_db"),
        user=os.getenv("DATABASE_USER", "postgres"),
        password=os.getenv("DATABASE_PASSWORD", "adhyaan123")
    )

def delete_academic_duplicates():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Identify duplicates in academic_books
    # We group by the main fields and find those with count > 1
    # We keep the one with the latest created_at or the one with a file_path if others don't have it
    
    cur.execute("""
        WITH duplicates AS (
            SELECT 
                book_name, board, course_name, year, part, semester, subject, chapter_name,
                ARRAY_AGG(id ORDER BY (file_path IS NOT NULL) DESC, created_at DESC) as ids,
                COUNT(*) as cnt
            FROM academic_books
            GROUP BY book_name, board, course_name, year, part, semester, subject, chapter_name
            HAVING COUNT(*) > 1
        )
        SELECT * FROM duplicates;
    """)
    
    rows = cur.fetchall()
    print(f"Found {len(rows)} groups of duplicates in academic_books")
    
    total_deleted = 0
    for row in rows:
        # Keep the first ID (latest), delete the rest
        ids_to_delete = row['ids'][1:]
        if ids_to_delete:
            cur.execute("DELETE FROM academic_books WHERE id = ANY(%s)", (ids_to_delete,))
            total_deleted += len(ids_to_delete)
    
    conn.commit()
    print(f"Deleted {total_deleted} duplicate rows from academic_books")
    cur.close()
    conn.close()

def delete_indie_duplicates():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute("""
        WITH duplicates AS (
            SELECT 
                title, author_name, genre,
                ARRAY_AGG(id ORDER BY (file_path IS NOT NULL) DESC, created_at DESC) as ids,
                COUNT(*) as cnt
            FROM indie_books
            GROUP BY title, author_name, genre
            HAVING COUNT(*) > 1
        )
        SELECT * FROM duplicates;
    """)
    
    rows = cur.fetchall()
    print(f"Found {len(rows)} groups of duplicates in indie_books")
    
    total_deleted = 0
    for row in rows:
        ids_to_delete = row['ids'][1:]
        if ids_to_delete:
            cur.execute("DELETE FROM indie_books WHERE id = ANY(%s)", (ids_to_delete,))
            total_deleted += len(ids_to_delete)
    
    conn.commit()
    print(f"Deleted {total_deleted} duplicate rows from indie_books")
    cur.close()
    conn.close()

if __name__ == "__main__":
    delete_academic_duplicates()
    delete_indie_duplicates()
