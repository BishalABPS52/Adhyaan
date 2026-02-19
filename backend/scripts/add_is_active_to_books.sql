-- Add is_active column to academic_books and indie_books
ALTER TABLE academic_books ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE indie_books ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
-- Optionally set all existing rows to active
UPDATE academic_books SET is_active = TRUE WHERE is_active IS NULL;
UPDATE indie_books SET is_active = TRUE WHERE is_active IS NULL;
