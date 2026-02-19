-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(50) NOT NULL UNIQUE,
    level VARCHAR(100) NOT NULL, -- 'undergraduate', 'masters', 'diploma', 'secondary', 'primary'
    board VARCHAR(100), -- 'TU', 'KU', 'PU', 'NEB', 'CBSE', 'CTEVT'
    total_semesters INTEGER,
    total_years INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create course_books junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS course_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    semester INTEGER,
    year INTEGER,
    part VARCHAR(10),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, book_id, semester, year, part)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_board ON courses(board);
CREATE INDEX IF NOT EXISTS idx_courses_short_code ON courses(short_code);
CREATE INDEX IF NOT EXISTS idx_course_books_course_id ON course_books(course_id);
CREATE INDEX IF NOT EXISTS idx_course_books_book_id ON course_books(book_id);

-- Insert sample undergraduate courses
INSERT INTO courses (name, short_code, level, board, total_semesters, total_years, description) VALUES
('Bachelor in Computer Engineering', 'BCT', 'undergraduate', 'TU', 8, 4, 'Four-year engineering program in computer engineering'),
('Bachelor in Civil Engineering', 'BCE', 'undergraduate', 'TU', 8, 4, 'Four-year engineering program in civil engineering'),
('Bachelor in Electrical Engineering', 'BEE', 'undergraduate', 'TU', 8, 4, 'Four-year engineering program in electrical engineering'),
('Bachelor in Business Administration', 'BBA', 'undergraduate', 'TU', 8, 4, 'Four-year business administration program'),
('Bachelor in Information Technology', 'BIT', 'undergraduate', 'TU', 8, 4, 'Four-year IT program')
ON CONFLICT (short_code) DO NOTHING;

-- Insert sample masters courses
INSERT INTO courses (name, short_code, level, board, total_semesters, total_years, description) VALUES
('Masters in Business Administration', 'MBA', 'masters', 'TU', 4, 2, 'Two-year MBA program'),
('Masters in Computer Science', 'MCS', 'masters', 'TU', 4, 2, 'Two-year computer science masters'),
('Masters in Engineering', 'M.E', 'masters', 'TU', 4, 2, 'Two-year engineering masters')
ON CONFLICT (short_code) DO NOTHING;

-- Insert sample diploma courses
INSERT INTO courses (name, short_code, level, board, total_semesters, total_years, description) VALUES
('Diploma in Civil Engineering', 'DCE', 'diploma', 'CTEVT', 6, 3, 'Three-year diploma in civil engineering'),
('Diploma in Electrical Engineering', 'DEE', 'diploma', 'CTEVT', 6, 3, 'Three-year diploma in electrical engineering'),
('Diploma in Computer Engineering', 'DCOE', 'diploma', 'CTEVT', 6, 3, 'Three-year diploma in computer engineering')
ON CONFLICT (short_code) DO NOTHING;

-- Comments
COMMENT ON TABLE courses IS 'Academic courses/programs';
COMMENT ON TABLE course_books IS 'Junction table linking books to courses';
