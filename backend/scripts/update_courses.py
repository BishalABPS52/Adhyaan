import sys
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid

# Add parent directory to path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

# Manual board data structure mirroring USER's desired page.jsx
board_data = {
    "NEB": {
      "name": "National Examination Board",
      "short": "NEB",
      "type": "School Level",
      "years": ["Grade 11", "Grade 12"],
      "courses": [
        { "name": "+2 Science", "short": "Science", "code": "Science" },
        { "name": "+2 Management", "short": "Management", "code": "Management" },
        { "name": "+2 Humanities", "short": "Humanities", "code": "Humanities" },
        { "name": "+2 Education", "short": "Education", "code": "Education" },
        { "name": "+2 Law", "short": "Law", "code": "Law" },
      ],
    },
    "TU": {
      "name": "Tribhuvan University (General Faculties)",
      "short": "TU",
      "type": "University Level",
      "years": [1, 2, 3, 4],
      "semesters": [1, 2, 3, 4, 5, 6, 7, 8],
      "courses": [
        { "name": "Bachelor of Arts", "short": "BA", "code": "BA" },
        { "name": "Bachelor of Business Administration", "short": "BBA", "code": "BBA" },
        { "name": "Bachelor of Business Studies", "short": "BBS", "code": "BBS" },
        { "name": "Bachelor of Computer Application", "short": "BCA", "code": "BCA" },
        { "name": "Bachelor of Education", "short": "BEd", "code": "BEd" },
        { "name": "Bachelor of Hotel Management", "short": "BHM", "code": "BHM" },
        { "name": "Bachelor of Information Management", "short": "BIM", "code": "BIM" },
        { "name": "Bachelor of Laws", "short": "LLB", "code": "LLB" },
        { "name": "Bachelor of Pharmacy", "short": "BPharm", "code": "BPharm" },
        { "name": "Bachelor of Science", "short": "BSc", "code": "BSc" },
        { "name": "BSc Computer Science and Information Technology", "short": "BSc CSIT", "code": "BSc CSIT" },
        { "name": "Masters in Business Administration", "short": "MBA", "code": "MBA" },
        { "name": "Masters in Computer Science", "short": "Mcs", "code": "Mcs" },
      ],
    },
    "TU_IOE": {
      "name": "Tribhuvan University - Institute of Engineering",
      "short": "IOE",
      "type": "Engineering",
      "years": [1, 2, 3, 4],
      "semesters": [1, 2, 3, 4, 5, 6, 7, 8],
      "courses": [
        { "name": "Bachelor of Aerospace Engineering", "short": "BAE", "code": "BAE" },
        { "name": "Bachelor of Agricultural Engineering", "short": "BAG", "code": "BAG" },
        { "name": "Bachelor of Architecture", "short": "BArch", "code": "BAR" },
        { "name": "Bachelor of Automobile Engineering", "short": "BAM", "code": "BAM" },
        { "name": "Bachelor of Chemical Engineering", "short": "BCH", "code": "BCH" },
        { "name": "Bachelor of Civil Engineering", "short": "BCE", "code": "BCE" },
        { "name": "Bachelor of Computer Engineering", "short": "BCT", "code": "BCT" },
        { "name": "Bachelor of Electrical Engineering", "short": "BEL", "code": "BEL" },
        { "name": "Bachelor of Electronics and Communication Engineering", "short": "BEI", "code": "BEI" },
        { "name": "Bachelor of Geomatics Engineering", "short": "BGE", "code": "BGE" },
        { "name": "Bachelor of Industrial Engineering", "short": "BIE", "code": "BIE" },
        { "name": "Bachelor of Mechanical Engineering", "short": "BME", "code": "BME" },
      ],
    },
    "TU_IOST": {
      "name": "Tribhuvan University - Institute of Science and Technology",
      "short": "IOST",
      "type": "Science & Tech",
      "years": [1, 2, 3, 4],
      "semesters": [1, 2, 3, 4, 5, 6, 7, 8],
      "courses": [
        { "name": "Bachelor in Information Technology", "short": "BIT", "code": "BIT" },
        { "name": "Bachelor of Science in Biotechnology", "short": "BSc Biotech", "code": "BSc Biotech" },
        { "name": "Bachelor of Science in Computer Science and Information Technology", "short": "BSc CSIT", "code": "BSc CSIT" },
        { "name": "Bachelor of Science in Environmental Science", "short": "BSc Env", "code": "BSc Env" },
        { "name": "Bachelor of Science in Microbiology", "short": "BSc Micro", "code": "BSc Micro" },
      ],
    },
    "TU_IOM": {
      "name": "Tribhuvan University - Institute of Medicine",
      "short": "IOM",
      "type": "Medicine",
      "years": [1, 2, 3, 4, 5],
      "semesters": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "courses": [
        { "name": "Bachelor of Audiology and Speech Language Pathology", "short": "BASLP", "code": "BASLP" },
        { "name": "Bachelor of Dental Surgery", "short": "BDS", "code": "BDS" },
        { "name": "Bachelor of Medicine, Bachelor of Surgery", "short": "MBBS", "code": "MBBS" },
        { "name": "Bachelor of Nursing Science", "short": "BNS", "code": "BNS" },
        { "name": "Bachelor of Optometry", "short": "BOptom", "code": "BOPTOM" },
        { "name": "Bachelor of Pharmacy", "short": "BPharm", "code": "BPHARM" },
        { "name": "Bachelor of Public Health", "short": "BPH", "code": "BPH" },
        { "name": "Bachelor of Science in Medical Imaging Technology", "short": "BSc MIT", "code": "BSc MIT" },
        { "name": "Bachelor of Science in Medical Laboratory Technology", "short": "BSc MLT", "code": "BSc MLT" },
        { "name": "Bachelor of Science in Nursing", "short": "BSc Nursing", "code": "BSc Nursing" },
      ],
    },
    "KU": {
      "name": "Kathmandu University",
      "short": "KU",
      "type": "University Level",
      "years": [1, 2, 3, 4],
      "semesters": [1, 2, 3, 4, 5, 6, 7, 8],
      "courses": [
        { "name": "Bachelor in Information Technology", "short": "BIT", "code": "BIT" },
        { "name": "Bachelor of Architecture", "short": "BArch", "code": "BARCH" },
        { "name": "Bachelor of Business Administration", "short": "BBA", "code": "BBA" },
        { "name": "Bachelor of Business Information Systems", "short": "BBIS", "code": "BBIS" },
        { "name": "Bachelor of Dental Surgery", "short": "BDS", "code": "BDS" },
        { "name": "Bachelor of Engineering in Chemical Engineering", "short": "BE Chemical", "code": "BE Chemical" },
        { "name": "Bachelor of Engineering in Civil Engineering", "short": "BE Civil", "code": "BE Civil" },
        { "name": "Bachelor of Engineering in Computer Engineering", "short": "BE Computer", "code": "BE Computer" },
        { "name": "Bachelor of Engineering in Electrical and Electronics Engineering", "short": "BE Electrical", "code": "BE Electrical" },
        { "name": "Bachelor of Engineering in Mechanical Engineering", "short": "BE Mechanical", "code": "BE Mechanical" },
        { "name": "Bachelor of Pharmacy", "short": "BPharm", "code": "BPHARM" },
        { "name": "Bachelor of Science in Computer Science", "short": "BSc CS", "code": "BSc CS" },
        { "name": "Bachelor of Science in Nursing", "short": "BSc Nursing", "code": "BSc Nursing" },
      ],
    },
    "PU_POKHARA": {
      "name": "Pokhara University",
      "short": "PoU",
      "type": "University Level",
      "years": [1, 2, 3, 4],
      "semesters": [1, 2, 3, 4, 5, 6, 7, 8],
      "courses": [
        { "name": "Bachelor of Business Administration", "short": "BBA", "code": "BBA" },
        { "name": "Bachelor of Computer Application", "short": "BCA", "code": "BCA" },
        { "name": "Bachelor of Civil Engineering", "short": "BE Civil", "code": "BE Civil" },
        { "name": "Bachelor of Computer Engineering", "short": "BE Computer", "code": "BE Computer" },
        { "name": "Bachelor of Electrical and Electronics Engineering", "short": "BE EEE", "code": "BE EEE" },
        { "name": "Bachelor of Electronics and Communication Engineering", "short": "BE EI", "code": "BE EI" },
        { "name": "Bachelor of Software Engineering", "short": "BE Software", "code": "BE Software" },
        { "name": "Bachelor of Health Care Management", "short": "BHCM", "code": "BHCM" },
        { "name": "Bachelor of Hotel Management", "short": "BHM", "code": "BHM" },
        { "name": "Bachelor of Pharmacy", "short": "BPharm", "code": "BPHARM" },
        { "name": "Bachelor of Science in Biochemistry", "short": "BSc Biochem", "code": "BSc Biochem" },
        { "name": "Bachelor of Science in Nursing", "short": "BSc Nursing", "code": "BSc Nursing" },
      ],
    },
    "PU_PURBANCHAL": {
      "name": "Purbanchal University",
      "short": "PU",
      "type": "University Level",
      "years": [1, 2, 3, 4],
      "semesters": [1, 2, 3, 4, 5, 6, 7, 8],
      "courses": [
        { "name": "Bachelor in Information Technology", "short": "BIT", "code": "BIT" },
        { "name": "Bachelor of Arts", "short": "BA", "code": "BA" },
        { "name": "Bachelor of Biomedical Engineering", "short": "BE Biomedical", "code": "BE Biomedical" },
        { "name": "Bachelor of Business Administration", "short": "BBA", "code": "BBA" },
        { "name": "Bachelor of Business Studies", "short": "BBS", "code": "BBS" },
        { "name": "Bachelor of Civil Engineering", "short": "BE Civil", "code": "BE Civil" },
        { "name": "Bachelor of Computer Application", "short": "BCA", "code": "BCA" },
        { "name": "Bachelor of Computer Engineering", "short": "BE Computer", "code": "BE Computer" },
        { "name": "Bachelor of Electronics, Communication and Automation Engineering", "short": "BE ECA", "code": "BE ECA" },
        { "name": "Bachelor of Pharmacy", "short": "BPharm", "code": "BPHARM" },
        { "name": "Bachelor of Science in Agriculture", "short": "BSc Agri", "code": "BSc Agri" },
        { "name": "Bachelor of Science in Nursing", "short": "BSc Nursing", "code": "BSc Nursing" },
        { "name": "Bachelor of Veterinary Science and Animal Husbandry", "short": "BVSc & AH", "code": "BVSC" },
      ],
    },
    "CTEVT": {
      "name": "Council for Technical Education and Vocational Training",
      "short": "CTEVT",
      "type": "Diploma Level",
      "years": [1, 2, 3],
      "semesters": [1, 2, 3, 4, 5, 6],
      "courses": [
        { "name": "Diploma in Automobile Engineering", "short": "Automobile", "code": "Automobile" },
        { "name": "Diploma in Civil Engineering", "short": "Civil", "code": "Civil" },
        { "name": "Diploma in Computer Engineering", "short": "Computer", "code": "Computer" },
        { "name": "Diploma in Electrical Engineering", "short": "Electrical", "code": "Electrical" },
        { "name": "Diploma in Electronics Engineering", "short": "Electronics", "code": "Electronics" },
        { "name": "Diploma in Hotel Management", "short": "Hotel Management", "code": "Hotel Management" },
        { "name": "Diploma in Information Technology", "short": "IT", "code": "IT" },
        { "name": "Diploma in Mechanical Engineering", "short": "Mechanical", "code": "Mechanical" },
        { "name": "Diploma in Nursing", "short": "Nursing", "code": "Nursing" },
        { "name": "Diploma in Pharmacy", "short": "Pharmacy", "code": "Pharmacy" },
      ],
    },
    "OTHERS": {
      "name": "Other Universities / Boards",
      "short": "Others",
      "type": "Other",
      "years": ["Year 1", "Year 2", "Year 3", "Year 4"],
      "semesters": [],
      "courses": [], 
    },
}

def get_connection():
    conn_params = {
        'host': settings.DATABASE_HOST,
        'port': settings.DATABASE_PORT,
        'database': settings.DATABASE_NAME,
        'user': settings.DATABASE_USER,
        'password': settings.DATABASE_PASSWORD,
    }
    
    # Resolve IP (like in Database class)
    try:
        import socket
        host_ip = socket.gethostbyname(settings.DATABASE_HOST)
        conn_params['host'] = host_ip
    except:
        pass
        
    return psycopg2.connect(**conn_params)

def run_migration():
    print("Connecting to database...")
    try:
        conn = get_connection()
        conn.autocommit = True
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 1. Create boards table
        print("Ensuring 'boards' table exists...")
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS boards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT UNIQUE NOT NULL,
            short_name TEXT,
            code TEXT,
            type TEXT,
            logo_url TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """)
        
        # 2. Add board_id to courses table
        print("Checking for 'board_id' column in 'courses'...")
        cursor.execute("""
        DO $$ 
        BEGIN 
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='board_id') THEN 
                ALTER TABLE courses ADD COLUMN board_id UUID REFERENCES boards(id);
                RAISE NOTICE 'Added board_id column';
            END IF;
        END $$;
        """)

        print("Migrating Board and Course data...")
        
        for board_key, board_info in board_data.items():
            board_name = board_info['name']
            
            # Upsert Board
            print(f"Processing Board: {board_name}")
            cursor.execute("""
                INSERT INTO boards (name, short_name, type)
                VALUES (%s, %s, %s)
                ON CONFLICT (name) DO UPDATE 
                SET short_name = EXCLUDED.short_name, 
                    type = EXCLUDED.type
                RETURNING id;
            """, (board_name, board_info.get('short', board_name), board_info.get('type', 'University Level')))
            
            result = cursor.fetchone()
            board_id = result['id']
            
            # Process Courses
            if 'courses' in board_info:
                for course in board_info['courses']:
                    c_name = course['name']
                    c_code = course.get('code', course.get('short', '')) # Use code from JS, fallback to short
                    
                    # Determine totals
                    total_years = len(board_info.get('years', []))
                    total_sems = len(board_info.get('semesters', []))
                    if total_years == 0 and total_sems == 0:
                        total_years = 4 # Default
                        total_sems = 8
                    
                    # Check if course exists
                    cursor.execute("SELECT id FROM courses WHERE name = %s AND board = %s", (c_name, board_name))
                    existing = cursor.fetchone()
                    
                    if existing:
                        # Update
                        cursor.execute("""
                            UPDATE courses 
                            SET short_code = %s,
                                board_id = %s,
                                total_years = %s,
                                total_semesters = %s,
                                updated_at = NOW()
                            WHERE id = %s
                        """, (c_code, board_id, total_years, total_sems, existing['id']))
                        # print(f"Updated course: {c_name}")
                    else:
                        # Insert
                        cursor.execute("""
                            INSERT INTO courses (
                                name, short_code, level, board, board_id, 
                                total_years, total_semesters, description, is_active
                            ) VALUES (
                                %s, %s, %s, %s, %s,
                                %s, %s, '', true
                            )
                        """, (
                            c_name, c_code, 
                            board_info.get('type', 'Bachelor'), 
                            board_name, 
                            board_id,
                            total_years, 
                            total_sems
                        ))
        
        print("Migration completed successfully.")
        
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    run_migration()
