-- Adhyaan Full Supabase Schema Initialization
-- Derived from local development database for full feature compatibility

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE activation_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE book_type AS ENUM ('indie', 'academic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('syllabus', 'book', 'questions');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM ('NID', 'Citizenship', 'License', 'Teacher_ID');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE education_level AS ENUM (
        'primary', 'secondary', 'undergraduate', 'masters', 'diploma', 
        'school', 'university', 'engineering', 'science', 'medicine', 
        'graduate', 'research'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE upload_type AS ENUM ('chapter_wise', 'full_book', 'research_paper', 'question_bank');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'studreader', 'author', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Create Common Functions
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Core Tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role user_role NOT NULL DEFAULT 'studreader',
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    author_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    profile_image_url TEXT,
    bio TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Authors table
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(50) NOT NULL,
    level VARCHAR(100) NOT NULL,
    board VARCHAR(100) NOT NULL,
    total_semesters INTEGER,
    total_years INTEGER,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(board, short_code)
);

-- Academic Books table (Comprehensive)
CREATE TABLE IF NOT EXISTS academic_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    description TEXT,
    cover_image_url TEXT,
    file_path TEXT,
    file_type VARCHAR(20),
    isbn VARCHAR(20),
    published_date DATE,
    category VARCHAR(100),
    tags TEXT[],
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    reader_count INTEGER DEFAULT 0,
    total_readers INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    upload_type upload_type,
    level education_level,
    board VARCHAR(100),
    class VARCHAR(50),
    year INTEGER,
    part VARCHAR(10),
    semester INTEGER,
    subject VARCHAR(100),
    subject_name VARCHAR(255),
    book_name VARCHAR(500),
    chapter_name VARCHAR(255),
    chapter_number INTEGER,
    course_name VARCHAR(200),
    course_code VARCHAR(100),
    authors VARCHAR(500),
    publication_year INTEGER,
    keywords VARCHAR(500),
    document_provider VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID
);

-- Indie Books table
CREATE TABLE IF NOT EXISTS indie_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    uploaded_author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    description TEXT,
    cover_image_url TEXT,
    file_path TEXT,
    file_type VARCHAR(20),
    isbn VARCHAR(20),
    published_date DATE,
    category VARCHAR(100),
    tags TEXT[],
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    reader_count INTEGER DEFAULT 0,
    total_readers INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    genre VARCHAR(100),
    publication_name VARCHAR(255),
    published_year INTEGER,
    author_contact VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Legacy/Generic Books table (if still referenced)
CREATE TABLE IF NOT EXISTS books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    uploaded_author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    book_type book_type NOT NULL,
    content_type content_type DEFAULT 'book',
    title VARCHAR(500) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    file_url TEXT NOT NULL,
    file_type character varying(10) NOT NULL,
    genre character varying(100),
    author_name character varying(255),
    publication_name character varying(255),
    published_year integer,
    author_contact character varying(50),
    upload_type upload_type,
    level education_level,
    board character varying(100),
    class_level integer,
    year integer,
    part character varying(10),
    semester integer,
    subject_name character varying(255),
    chapter_name character varying(255),
    chapter_number integer,
    course_name character varying(200),
    course_code character varying(100),
    rating numeric(3,2) DEFAULT 0.00,
    review_count integer DEFAULT 0,
    reader_count integer DEFAULT 0,
    total_reviews integer DEFAULT 0,
    total_readers integer DEFAULT 0,
    is_published boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Book Ratings
CREATE TABLE IF NOT EXISTS book_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, user_id)
);

-- Book Readers
CREATE TABLE IF NOT EXISTS book_readers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, user_id)
);

-- Course Books Junction
CREATE TABLE IF NOT EXISTS course_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    book_id UUID NOT NULL, -- Generic ID, we don't enforce FK here since it spans tables
    semester INTEGER,
    year INTEGER,
    part VARCHAR(10),
    is_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, book_id, semester, year, part)
);

-- Study Rooms
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

-- Author Activation Requests
CREATE TABLE IF NOT EXISTS author_activation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    parents_name VARCHAR(255),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    permanent_address TEXT NOT NULL,
    temporary_address TEXT,
    document_type document_type NOT NULL,
    document_no VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    status activation_status DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Author Activation Documents
CREATE TABLE IF NOT EXISTS author_activation_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES author_activation_requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Triggers for automations
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add more triggers as needed for other tables
