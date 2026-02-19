from typing import List, Dict, Any, Optional
from uuid import UUID
import json
from app.core.database import Database


class ContentRepository:
    """Repository for managing academic content (syllabus, questions)"""
    
    def __init__(self):
        self.db = Database()
    
    # ==================== SYLLABUS METHODS ====================
    
    def create_syllabus(self, author_id: UUID, syllabus_data: Dict[str, Any], file_path: Optional[str] = None) -> Dict[str, Any]:
        """Create a new syllabus"""
        query = """
            INSERT INTO books (
                author_id, title, content_type, book_type,
                course_name, course_code,
                board, class, subject, semester, year, part,
                description, language, file_path
            ) VALUES (
                %s, %s, 'syllabus', 'academic',
                %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s
            )
            RETURNING id, title, content_type, course_name, course_code,
                      board, class, subject, semester, year, part,
                      description, language, file_path, created_at
        """
        
        params = (
            str(author_id),
            syllabus_data['title'],
            syllabus_data['course_name'],
            syllabus_data.get('course_code'),
            syllabus_data['board'],
            syllabus_data['class'],
            syllabus_data['subject'],
            syllabus_data.get('semester'),
            syllabus_data.get('year'),
            syllabus_data.get('part'),
            syllabus_data.get('description'),
            syllabus_data.get('language', 'English'),
            file_path
        )
        
        result = self.db.fetch_one(query, params)
        if result:
            return dict(result)
        return None
    
    def get_syllabi_by_author(self, author_id: UUID) -> List[Dict[str, Any]]:
        """Get all syllabi created by an author"""
        query = """
            SELECT id, author_id, title, content_type,
                   course_name, course_code,
                   board, class, subject, semester, year, part,
                   description, language, file_path,
                   created_at, updated_at
            FROM books
            WHERE author_id = %s AND content_type = 'syllabus'
            ORDER BY created_at DESC
        """
        
        results = self.db.fetch_all(query, (str(author_id),))
        return [dict(row) for row in results] if results else []
    
    def get_syllabi_by_course(self, board: str, class_name: str, subject: str, semester: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get syllabi for a specific course"""
        if semester:
            query = """
                SELECT id, author_id, title, content_type,
                       course_name, course_code,
                       board, class, subject, semester, year, part,
                       description, language, file_path,
                       created_at, updated_at
                FROM books
                WHERE content_type = 'syllabus'
                  AND board = %s AND class = %s AND subject = %s AND semester = %s
                ORDER BY created_at DESC
            """
            params = (board, class_name, subject, semester)
        else:
            query = """
                SELECT id, author_id, title, content_type,
                       course_name, course_code,
                       board, class, subject, semester, year, part,
                       description, language, file_path,
                       created_at, updated_at
                FROM books
                WHERE content_type = 'syllabus'
                  AND board = %s AND class = %s AND subject = %s
                ORDER BY created_at DESC
            """
            params = (board, class_name, subject)
        
        results = self.db.fetch_all(query, params)
        return [dict(row) for row in results] if results else []
    
    # ==================== QUESTIONS BOOK METHODS ====================
    
    def create_questions_book(self, author_id: UUID, book_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new questions book/bank"""
        query = """
            INSERT INTO books (
                author_id, title, content_type, book_type,
                board, class, subject, chapter_name, topic,
                semester, year, part,
                description, language
            ) VALUES (
                %s, %s, 'questions', 'academic',
                %s, %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s
            )
            RETURNING id, title, content_type,
                      board, class, subject, chapter_name, topic,
                      semester, year, part,
                      description, language, created_at
        """
        
        params = (
            str(author_id),
            book_data['title'],
            book_data['board'],
            book_data['class'],
            book_data['subject'],
            book_data.get('chapter_name'),
            book_data.get('topic'),
            book_data.get('semester'),
            book_data.get('year'),
            book_data.get('part'),
            book_data.get('description'),
            book_data.get('language', 'English')
        )
        
        result = self.db.fetch_one(query, params)
        if result:
            return dict(result)
        return None
    
    def get_questions_books_by_author(self, author_id: UUID) -> List[Dict[str, Any]]:
        """Get all questions books created by an author"""
        query = """
            SELECT b.id, b.author_id, b.title, b.content_type,
                   b.board, b.class, b.subject, b.chapter_name, b.topic,
                   b.semester, b.year, b.part,
                   b.description, b.language,
                   b.created_at, b.updated_at,
                   COUNT(q.id) as questions_count
            FROM books b
            LEFT JOIN questions q ON b.id = q.book_id
            WHERE b.author_id = %s AND b.content_type = 'questions'
            GROUP BY b.id
            ORDER BY b.created_at DESC
        """
        
        results = self.db.fetch_all(query, (str(author_id),))
        return [dict(row) for row in results] if results else []
    
    # ==================== QUESTION METHODS ====================
    
    def create_question(self, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new question"""
        # Get book metadata to inherit board, class, subject, etc.
        book_query = """
            SELECT board, class, subject, chapter_name, topic
            FROM books WHERE id = %s
        """
        book = self.db.fetch_one(book_query, (str(question_data['book_id']),))
        
        if not book:
            raise ValueError("Questions book not found")
        
        # Convert options list to JSON
        options_json = json.dumps(question_data.get('options')) if question_data.get('options') else None
        
        query = """
            INSERT INTO questions (
                book_id, author_id,
                question_text, question_type, options, correct_answer,
                marks, difficulty, explanation,
                board, class, subject, chapter_name, topic
            ) VALUES (
                %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s,
                %s, %s, %s, %s, %s
            )
            RETURNING id, book_id, author_id,
                      question_text, question_type, options, correct_answer,
                      marks, difficulty, explanation,
                      board, class, subject, chapter_name, topic,
                      created_at
        """
        
        params = (
            str(question_data['book_id']),
            str(question_data['author_id']),
            question_data['question_text'],
            question_data['question_type'],
            options_json,
            question_data['correct_answer'],
            question_data.get('marks', 1),
            question_data.get('difficulty', 'medium'),
            question_data.get('explanation'),
            book['board'],
            book['class'],
            book['subject'],
            book.get('chapter_name'),
            book.get('topic')
        )
        
        result = self.db.fetch_one(query, params)
        if result:
            row_dict = dict(result)
            # Parse JSON options back to list
            if row_dict.get('options'):
                row_dict['options'] = json.loads(row_dict['options'])
            return row_dict
        return None
    
    def get_questions_by_book(self, book_id: UUID, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all questions for a questions book"""
        query = """
            SELECT id, book_id, author_id,
                   question_text, question_type, options, correct_answer,
                   marks, difficulty, explanation,
                   board, class, subject, chapter_name, topic,
                   created_at, updated_at
            FROM questions
            WHERE book_id = %s
            ORDER BY created_at DESC
            LIMIT %s
        """
        
        results = self.db.fetch_all(query, (str(book_id), limit))
        if results:
            questions = []
            for row in results:
                q = dict(row)
                # Parse JSON options back to list
                if q.get('options'):
                    q['options'] = json.loads(q['options'])
                questions.append(q)
            return questions
        return []
    
    def update_question(self, question_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a question"""
        # Build dynamic update query
        update_fields = []
        params = []
        
        if 'question_text' in update_data:
            update_fields.append("question_text = %s")
            params.append(update_data['question_text'])
        
        if 'question_type' in update_data:
            update_fields.append("question_type = %s")
            params.append(update_data['question_type'])
        
        if 'options' in update_data:
            update_fields.append("options = %s")
            params.append(json.dumps(update_data['options']) if update_data['options'] else None)
        
        if 'correct_answer' in update_data:
            update_fields.append("correct_answer = %s")
            params.append(update_data['correct_answer'])
        
        if 'marks' in update_data:
            update_fields.append("marks = %s")
            params.append(update_data['marks'])
        
        if 'difficulty' in update_data:
            update_fields.append("difficulty = %s")
            params.append(update_data['difficulty'])
        
        if 'explanation' in update_data:
            update_fields.append("explanation = %s")
            params.append(update_data['explanation'])
        
        if not update_fields:
            return None
        
        params.append(str(question_id))
        
        query = f"""
            UPDATE questions
            SET {', '.join(update_fields)}
            WHERE id = %s
            RETURNING id, book_id, author_id,
                      question_text, question_type, options, correct_answer,
                      marks, difficulty, explanation,
                      board, class, subject, chapter_name, topic,
                      created_at, updated_at
        """
        
        result = self.db.fetch_one(query, tuple(params))
        if result:
            row_dict = dict(result)
            if row_dict.get('options'):
                row_dict['options'] = json.loads(row_dict['options'])
            return row_dict
        return None
    
    def delete_question(self, question_id: UUID, author_id: UUID) -> bool:
        """Delete a question"""
        query = """
            DELETE FROM questions
            WHERE id = %s AND author_id = %s
        """
        
        return self.db.execute(query, (str(question_id), str(author_id)))
    
    def delete_content(self, content_id: UUID, author_id: UUID) -> bool:
        """Delete syllabus or questions book"""
        query = """
            DELETE FROM books
            WHERE id = %s AND author_id = %s AND content_type IN ('syllabus', 'questions')
        """
        
        return self.db.execute(query, (str(content_id), str(author_id)))


# Create singleton instance
content_repository = ContentRepository()
