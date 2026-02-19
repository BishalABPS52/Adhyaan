import os
import httpx
import asyncio
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import mimetypes

# Load environment variables
load_dotenv('/home/bishal-shrestha/adhyaan/backend/.env')

BLOB_TOKEN = os.getenv('BLOB_READ_WRITE_TOKEN')
DB_PARAMS = {
    'host': os.getenv('DATABASE_HOST', 'localhost'),
    'port': os.getenv('DATABASE_PORT', '5432'),
    'database': os.getenv('DATABASE_NAME', 'adhyaan_db'),
    'user': os.getenv('DATABASE_USER', 'postgres'),
    'password': os.getenv('DATABASE_PASSWORD', 'adhyaan123'),
}

LOCAL_COVER_PATH = '/home/bishal-shrestha/adhyaan/books/cover'
BASE_URL = "https://blob.vercel-storage.com"

async def upload_file(local_file_path, remote_filename):
    """Upload a local file to Vercel Blob."""
    with open(local_file_path, 'rb') as f:
        content = f.read()
    
    mime_type, _ = mimetypes.guess_type(local_file_path)
    if not mime_type:
        mime_type = 'image/png'

    unique_filename = f"covers/{remote_filename}"
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.put(
            f"{BASE_URL}/{unique_filename}",
            headers={
                "Authorization": f"Bearer {BLOB_TOKEN}",
                "x-content-type": mime_type,
                "x-add-random-suffix": "false"
            },
            content=content,
        )
        
        if response.status_code not in [200, 201]:
            print(f"Failed to upload {local_file_path}: {response.text}")
            return None
        
        return response.json().get("url")

async def main():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        mappings = [
            {'file': 'CN1.png', 'query': "book_name ILIKE '%Computer Network%' AND chapter_name ILIKE '%Chapter 1%'", 'table': 'academic_books'},
            {'file': 'CN2.png', 'query': "book_name ILIKE '%Computer Network%' AND chapter_name ILIKE '%Chapter 2%'", 'table': 'academic_books'},
            {'file': 'CN3.png', 'query': "book_name ILIKE '%Computer Network%' AND chapter_name ILIKE '%Chapter 3%'", 'table': 'academic_books'},
            {'file': 'WAP1.png', 'query': "book_name ILIKE '%Web Application Programming%' AND chapter_name ILIKE '%Chapter 1%'", 'table': 'academic_books'},
            {'file': 'Wap2.png', 'query': "book_name ILIKE '%Web Application Programming%' AND chapter_name ILIKE '%Chapter 2%'", 'table': 'academic_books'},
            {'file': 'DBMS.png', 'query': "book_name ILIKE '%Database Management System%'", 'table': 'academic_books'},
            {'file': 'kiterunner.png', 'query': "title ILIKE '%Kite Runner%'", 'table': 'indie_books'},
            {'file': 'apromisedland.png', 'query': "title ILIKE '%Promised Land%'", 'table': 'indie_books'},
            {'file': 'genderroles.png', 'query': "title ILIKE '%Gender Roles%' OR title ILIKE '%Harry Potter%'", 'table': 'indie_books'},
        ]

        for m in mappings:
            local_path = os.path.join(LOCAL_COVER_PATH, m['file'])
            if not os.path.exists(local_path):
                print(f"File not found: {local_path}")
                continue
            
            print(f"Uploading {m['file']}...")
            url = await upload_file(local_path, m['file'])
            if url:
                print(f"Uploaded to {url}. Updating database...")
                # Use subquery for academic books if multiple matches exist (just update one or all?)
                # ILIKE search
                if m['table'] == 'academic_books':
                    cursor.execute(f"UPDATE academic_books SET cover_image_url = %s WHERE {m['query']}", (url,))
                else:
                    cursor.execute(f"UPDATE indie_books SET cover_image_url = %s WHERE {m['query']}", (url,))
                
                print(f"Updated {cursor.rowcount} records in {m['table']}.")
            else:
                print(f"Skipping update for {m['file']}")

        conn.commit()
        print("All updates complete.")

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
    asyncio.run(main())
