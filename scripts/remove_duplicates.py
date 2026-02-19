import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/home/bishal-shrestha/adhyaan/backend/.env')

DB_PARAMS = {
    'host': os.getenv('DATABASE_HOST', 'localhost'),
    'port': os.getenv('DATABASE_PORT', '5432'),
    'database': os.getenv('DATABASE_NAME', 'adhyaan_db'),
    'user': os.getenv('DATABASE_USER', 'postgres'),
    'password': os.getenv('DATABASE_PASSWORD', 'adhyaan123'),
}

def remove_duplicates():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("Connected to database. Identifying duplicates...")
        
        # 1. Clean Academic Books
        # Combination: book_name, subject, board, course_name, year, semester
        cursor.execute("""
            SELECT book_name, subject, board, course_name, year, semester, array_agg(id) as ids
            FROM academic_books
            WHERE is_active = TRUE
            GROUP BY book_name, subject, board, course_name, year, semester
            HAVING COUNT(*) > 1
        """)
        academic_dupes = cursor.fetchall()
        print(f"Found {len(academic_dupes)} sets of duplicate academic books.")
        
        for dupe in academic_dupes:
            ids = dupe['ids']
            # Ensure ids is a list
            if isinstance(ids, str):
                ids = ids.strip('{}').split(',')
            
            if len(ids) > 1:
                ids_to_delete = ids[1:]
                print(f"Removing {len(ids_to_delete)} duplicates for '{dupe['book_name']}'")
                cursor.execute("DELETE FROM academic_books WHERE id = ANY(%s::uuid[])", (ids_to_delete,))
            
        # 2. Clean Indie Books
        # Combination: title, author_name (based on schema check)
        cursor.execute("""
            SELECT title, author_name, array_agg(id) as ids
            FROM indie_books
            WHERE is_active = TRUE
            GROUP BY title, author_name
            HAVING COUNT(*) > 1
        """)
        indie_dupes = cursor.fetchall()
        print(f"Found {len(indie_dupes)} sets of duplicate indie books.")
        
        for dupe in indie_dupes:
            ids = dupe['ids']
            if isinstance(ids, str):
                ids = ids.strip('{}').split(',')
                
            if len(ids) > 1:
                ids_to_delete = ids[1:]
                print(f"Removing {len(ids_to_delete)} duplicates for '{dupe['title']}'")
                cursor.execute("DELETE FROM indie_books WHERE id = ANY(%s::uuid[])", (ids_to_delete,))
            
        conn.commit()
        print("Cleanup complete.")
        
    except Exception as e:
        print(f"Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    remove_duplicates()
