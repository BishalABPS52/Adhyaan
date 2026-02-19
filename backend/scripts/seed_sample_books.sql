-- Seed sample books data for the new separate tables structure
-- This script inserts sample data into academic_books and indie_books tables

DO $$
DECLARE
    bishal_id UUID;
BEGIN
    -- Get Bishal's user ID (assuming bs426808@gmail.com exists)
    SELECT id INTO bishal_id FROM users WHERE email = 'bs426808@gmail.com' LIMIT 1;
    
    -- If user doesn't exist, use a default UUID
    IF bishal_id IS NULL THEN
        bishal_id := '40ac30b2-d054-4867-b8f3-df6c79d0b7ab'::UUID;
    END IF;

    -- Insert Academic Books
    INSERT INTO academic_books (
        board, book_name, course_name, year, semester, subject_name,
        file_url, file_type, uploaded_by, is_active
    ) VALUES
    ('TU', 'Database Management System', 'Computer Engineering', 3, 5, 'DBMS',
     '/books/academic/dbms.pdf', 'pdf', bishal_id, TRUE),
    ('TU', 'JavaScript Fundamentals', 'Computer Engineering', 2, 3, 'Web Technology',
     '/books/academic/js_unit2.pdf', 'pdf', bishal_id, TRUE),
    ('TU', 'Web Development', 'Computer Engineering', 2, 4, 'Web Technology',
     '/books/academic/web_unit1.pdf', 'pdf', bishal_id, TRUE);

    -- Insert Indie Books
    INSERT INTO indie_books (
        title, genre, author_name, publication_name, published_year,
        pdf_url, file_type, uploaded_by, is_active, description
    ) VALUES
    ('A Promised Land', 'Autobiography', 'Barack Obama', 'Crown Publishing', 2020,
     '/books/indie/a-promised-landfull-book-free_compress.pdf', 'pdf', bishal_id, TRUE,
     'A riveting, deeply personal account of history in the making—from the president who inspired us to believe in the power of democracy.'),
    ('The Kite Runner', 'Fiction', 'Khaled Hosseini', 'Riverhead Books', 2003,
     '/books/indie/the_kite_runner.pdf', 'pdf', bishal_id, TRUE,
     'The unforgettable, heartbreaking story of the unlikely friendship between a wealthy boy and the son of his father''s servant.'),
    ('Gender Roles in the Harry Potter', 'Academic Research', 'Various Authors', 'Academic Press', 2023,
     '/books/indie/Gender Roles in the Harry Potter.pdf', 'pdf', bishal_id, TRUE,
     'An academic analysis of gender roles in the Harry Potter series.');

END $$;

-- Verify the inserts
SELECT 'Academic books inserted:', COUNT(*) FROM academic_books;
SELECT 'Indie books inserted:', COUNT(*) FROM indie_books;
