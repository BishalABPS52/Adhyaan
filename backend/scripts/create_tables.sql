-- CREATE DATABASE adhyaan_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('studreader', 'author', 'admin');
CREATE TYPE book_type AS ENUM ('indie', 'academic');
CREATE TYPE content_type AS ENUM ('syllabus', 'book', 'questions');
CREATE TYPE upload_type AS ENUM ('chapter_wise', 'full_book', 'research_paper');
CREATE TYPE education_level AS ENUM ('primary', 'secondary', 'undergraduate', 'masters', 'diploma');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'studreader',
    current_role user_role NOT NULL DEFAULT 'studreader',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    profile_image_url TEXT,
    bio TEXT
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_current_role ON users(current_role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- Books table indexes
CREATE INDEX idx_books_uploaded_author ON books(uploaded_author_id);
CREATE INDEX idx_books_book_type ON books(book_type);
CREATE INDEX idx_books_content_type ON books(content_type);
CREATE INDEX idx_books_upload_type ON books(upload_type);
CREATE INDEX idx_books_level ON books(level);
CREATE INDEX idx_books_board_class ON books(board, class);
CREATE INDEX idx_books_subject ON books(subject);
CREATE INDEX idx_books_chapter_number ON books(chapter_number);
CREATE INDEX idx_books_course_name ON books(course_name);
CREATE INDEX idx_books_genre ON books(genre);
CREATE INDEX idx_books_published_year ON books(published_year);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Books table with comprehensive fields for indie and academic books
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    uploaded_author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    author_name VARCHAR(255),

    -- Book metadata
    description TEXT,
    cover_image_url TEXT,
    file_path TEXT,
    file_type VARCHAR(20),
    isbn VARCHAR(20),
    published_date DATE,
    category VARCHAR(100),
    tags TEXT[],

    -- Rating and engagement
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    reader_count INTEGER DEFAULT 0,
    total_readers INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,

    -- Book type and content type
    book_type book_type DEFAULT 'indie',
    content_type content_type DEFAULT 'book',
    upload_type upload_type,

    -- Education level and academic fields
    level education_level,
    board VARCHAR(100),
    class VARCHAR(50),
    year INTEGER,
    part VARCHAR(10),
    semester INTEGER,
    subject VARCHAR(100),
    chapter_name VARCHAR(255),
    chapter_number INTEGER,
    course_name VARCHAR(200),
    course_code VARCHAR(100),

    -- Indie book specific fields
    genre VARCHAR(100),
    publication_name VARCHAR(255),
    published_year INTEGER,
    author_contact VARCHAR(50),

    -- Research paper fields
    authors VARCHAR(500),
    publication_year INTEGER,
    keywords VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Study rooms table (for future use)
CREATE TABLE IF NOT EXISTS study_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    join_code VARCHAR(10) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_participants INTEGER DEFAULT 50,
    current_participants INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comments for documentation
COMMENT ON TABLE users IS 'Main users table for students, authors, and admins';
COMMENT ON COLUMN users.role IS 'User role: student, author, or admin';
COMMENT ON COLUMN users.is_active IS 'Whether user account is active';
COMMENT ON COLUMN users.is_verified IS 'Whether user email is verified';

COMMENT ON TABLE books IS 'Comprehensive books table supporting indie and academic content';
COMMENT ON COLUMN books.uploaded_author_id IS 'User who uploaded the book (not necessarily the author)';
COMMENT ON COLUMN books.author_name IS 'Name of the book author (can differ from uploader)';
COMMENT ON COLUMN books.book_type IS 'Type of book: indie or academic';
COMMENT ON COLUMN books.content_type IS 'Content type: syllabus, book, or questions';
COMMENT ON COLUMN books.upload_type IS 'Upload type: chapter_wise, full_book, or research_paper';
COMMENT ON COLUMN books.level IS 'Education level: primary, secondary, undergraduate, masters, diploma';
COMMENT ON COLUMN books.file_path IS 'Relative path to the book file';
COMMENT ON COLUMN books.file_type IS 'File extension (pdf, docx, etc.)';
COMMENT ON COLUMN books.rating IS 'Average rating calculated from user ratings';
COMMENT ON COLUMN books.review_count IS 'Number of reviews with text content';
COMMENT ON COLUMN books.reader_count IS 'Number of users who have read this book';
