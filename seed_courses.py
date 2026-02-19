
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('backend/.env')

def seed_courses():
    conn = psycopg2.connect(
        host=os.getenv("DATABASE_HOST"),
        port=os.getenv("DATABASE_PORT"),
        database=os.getenv("DATABASE_NAME"),
        user=os.getenv("DATABASE_USER"),
        password=os.getenv("DATABASE_PASSWORD")
    )
    cur = conn.cursor()

    # Clear existing courses for a clean state if needed, but safer to UPSERT
    # cur.execute("TRUNCATE courses CASCADE;")

    board_data = {
        'NEB': {
            'name': 'National Examination Board',
            'type': 'school',
            'courses': [
                {'name': '+2 Science', 'short': 'SCI'},
                {'name': '+2 Management', 'short': 'MGT'},
                {'name': '+2 Humanities', 'short': 'HUM'},
                {'name': '+2 Education', 'short': 'EDU'},
                {'name': '+2 Law', 'short': 'LAW'}
            ],
            'years': 2,
            'semesters': 0
        },
        'TU': {
            'name': 'Tribhuvan University (General Faculties)',
            'type': 'university',
            'courses': [
                {'name': 'Bachelor of Arts', 'short': 'BA'},
                {'name': 'Bachelor of Business Studies', 'short': 'BBS'},
                {'name': 'Bachelor of Business Administration', 'short': 'BBA'},
                {'name': 'Bachelor of Information Management', 'short': 'BIM'},
                {'name': 'Bachelor of Computer Application', 'short': 'BCA'},
                {'name': 'Bachelor of Science', 'short': 'BSc'},
                {'name': 'BSc Computer Science and Information Technology', 'short': 'CSIT'},
                {'name': 'Bachelor of Education', 'short': 'BEd'},
                {'name': 'Bachelor of Laws', 'short': 'LLB'},
                {'name': 'Bachelor of Pharmacy', 'short': 'BPharm'},
                {'name': 'Bachelor of Hotel Management', 'short': 'BHM'}
            ],
            'years': 4,
            'semesters': 8
        },
        'TU_IOE': {
            'name': 'Tribhuvan University - Institute of Engineering',
            'type': 'engineering',
            'courses': [
                {'name': 'Bachelor of Civil Engineering', 'short': 'BCE'},
                {'name': 'Bachelor of Computer Engineering', 'short': 'BCT'},
                {'name': 'Bachelor of Electrical Engineering', 'short': 'BEL'},
                {'name': 'Bachelor of Electronics and Communication Engineering', 'short': 'BEI'},
                {'name': 'Bachelor of Mechanical Engineering', 'short': 'BME'},
                {'name': 'Bachelor of Automobile Engineering', 'short': 'BAM'},
                {'name': 'Bachelor of Industrial Engineering', 'short': 'BIE'},
                {'name': 'Bachelor of Geomatics Engineering', 'short': 'BGE'},
                {'name': 'Bachelor of Agricultural Engineering', 'short': 'BAG'},
                {'name': 'Bachelor of Architecture', 'short': 'BAR'},
                {'name': 'Bachelor of Aerospace Engineering', 'short': 'BAE'},
                {'name': 'Bachelor of Chemical Engineering', 'short': 'BCH'}
            ],
            'years': 4,
            'semesters': 8
        },
        'TU_IOST': {
            'name': 'Tribhuvan University - Institute of Science and Technology',
            'type': 'science',
            'courses': [
                {'name': 'Bachelor in Information Technology', 'short': 'BIT'},
                {'name': 'BSc Computer Science and Information Technology', 'short': 'CSIT'},
                {'name': 'Bachelor of Science in Microbiology', 'short': 'MICRO'},
                {'name': 'Bachelor of Science in Environmental Science', 'short': 'ENV'},
                {'name': 'Bachelor of Science in Biotechnology', 'short': 'BIOTECH'}
            ],
            'years': 4,
            'semesters': 8
        },
        'TU_IOM': {
            'name': 'Tribhuvan University - Institute of Medicine',
            'type': 'medicine',
            'courses': [
                {'name': 'Bachelor of Medicine, Bachelor of Surgery', 'short': 'MBBS'},
                {'name': 'Bachelor of Dental Surgery', 'short': 'BDS'},
                {'name': 'Bachelor of Science in Nursing', 'short': 'BSCN'},
                {'name': 'Bachelor of Nursing Science', 'short': 'BNS'},
                {'name': 'Bachelor of Audiology and Speech Language Pathology', 'short': 'BASLP'},
                {'name': 'Bachelor of Optometry', 'short': 'BOPTOM'},
                {'name': 'Bachelor of Science in Medical Laboratory Technology', 'short': 'MLT'},
                {'name': 'Bachelor of Science in Medical Imaging Technology', 'short': 'MIT'},
                {'name': 'Bachelor of Public Health', 'short': 'BPH'},
                {'name': 'Bachelor of Pharmacy', 'short': 'BPHARM'}
            ],
            'years': 5,
            'semesters': 10
        },
        'KU': {
            'name': 'Kathmandu University',
            'type': 'university',
            'courses': [
                {'name': 'BE in Civil Engineering', 'short': 'BECIVIL'},
                {'name': 'BE in Computer Engineering', 'short': 'BECOMP'},
                {'name': 'BE in Electrical and Electronics Engineering', 'short': 'BEEE'},
                {'name': 'BE in Mechanical Engineering', 'short': 'BEMECH'},
                {'name': 'BE in Chemical Engineering', 'short': 'BECHEM'},
                {'name': 'Bachelor of Architecture', 'short': 'BARCH'},
                {'name': 'Bachelor in Information Technology', 'short': 'BIT'},
                {'name': 'Bachelor of Science in Computer Science', 'short': 'BSCS'},
                {'name': 'Bachelor of Business Administration', 'short': 'BBA'},
                {'name': 'Bachelor of Business Information Systems', 'short': 'BBIS'},
                {'name': 'Bachelor of Dental Surgery', 'short': 'BDS'},
                {'name': 'Bachelor of Science in Nursing', 'short': 'BSCN'},
                {'name': 'Bachelor of Pharmacy', 'short': 'BPHARM'}
            ],
            'years': 4,
            'semesters': 8
        },
        'PU_POKHARA': {
            'name': 'Pokhara University',
            'type': 'university',
            'courses': [
                {'name': 'BE Civil', 'short': 'BECIVIL'},
                {'name': 'BE Computer', 'short': 'BECOMP'},
                {'name': 'BE Software', 'short': 'BESOFT'},
                {'name': 'BE EEE', 'short': 'BEEE'},
                {'name': 'BE EI', 'short': 'BEEI'},
                {'name': 'Bachelor of Computer Application', 'short': 'BCA'},
                {'name': 'Bachelor of Business Administration', 'short': 'BBA'},
                {'name': 'Bachelor of Hotel Management', 'short': 'BHM'},
                {'name': 'Bachelor of Pharmacy', 'short': 'BPHARM'},
                {'name': 'Bachelor of Science in Nursing', 'short': 'BSCN'},
                {'name': 'Bachelor of Health Care Management', 'short': 'BHCM'},
                {'name': 'Bachelor of Science in Biochemistry', 'short': 'BSCBIO'}
            ],
            'years': 4,
            'semesters': 8
        },
        'PU_PURBANCHAL': {
            'name': 'Purbanchal University',
            'type': 'university',
            'courses': [
                {'name': 'BE Civil', 'short': 'BECIVIL'},
                {'name': 'BE Computer', 'short': 'BECOMP'},
                {'name': 'BE ECA', 'short': 'BECAE'},
                {'name': 'BE Biomedical', 'short': 'BEBIOMED'},
                {'name': 'Bachelor of Computer Application', 'short': 'BCA'},
                {'name': 'Bachelor of Business Administration', 'short': 'BBA'},
                {'name': 'Bachelor of Business Studies', 'short': 'BBS'},
                {'name': 'Bachelor of Arts', 'short': 'BA'},
                {'name': 'Bachelor in Information Technology', 'short': 'BIT'},
                {'name': 'BSc Agriculture', 'short': 'BSCAGRI'},
                {'name': 'Bachelor of Pharmacy', 'short': 'BPHARM'},
                {'name': 'Bachelor of Science in Nursing', 'short': 'BSCN'},
                {'name': 'BVSc & AH', 'short': 'BVSCAH'}
            ],
            'years': 4,
            'semesters': 8
        },
        'CTEVT': {
            'name': 'CTEVT',
            'type': 'diploma',
            'courses': [
                {'name': 'Diploma in Civil Engineering', 'short': 'DCE'},
                {'name': 'Diploma in Computer Engineering', 'short': 'DCOE'},
                {'name': 'Diploma in Electrical Engineering', 'short': 'DEE'},
                {'name': 'Diploma in Mechanical Engineering', 'short': 'DME'},
                {'name': 'Diploma in Electronics Engineering', 'short': 'DEELEC'},
                {'name': 'Diploma in Automobile Engineering', 'short': 'DAE'},
                {'name': 'Diploma in Information Technology', 'short': 'DIT'},
                {'name': 'Diploma in Pharmacy', 'short': 'DPHARM'},
                {'name': 'Diploma in Nursing', 'short': 'DNURS'},
                {'name': 'Diploma in Hotel Management', 'short': 'DHM'}
            ],
            'years': 3,
            'semesters': 6
        }
    }

    print("Seeding courses...")
    inserted_count = 0
    for board_code, data in board_data.items():
        for course in data['courses']:
            cur.execute("""
                INSERT INTO courses (name, short_code, level, board, total_years, total_semesters, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (board, short_code) DO UPDATE SET
                    name = EXCLUDED.name,
                    level = EXCLUDED.level,
                    total_years = EXCLUDED.total_years,
                    total_semesters = EXCLUDED.total_semesters
            """, (course['name'], course['short'], data['type'], board_code, data['years'], data['semesters'], True))
            inserted_count += 1

    conn.commit()
    cur.close()
    conn.close()
    print(f"Successfully seeded/updated {inserted_count} courses.")

if __name__ == "__main__":
    seed_courses()
