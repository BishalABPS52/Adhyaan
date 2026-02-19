-- Migration script to update user roles from consumer to studreader
-- and ensure current_role column exists

-- Update the user_role enum to replace 'consumer' with 'studreader'
ALTER TYPE user_role RENAME VALUE 'consumer' TO 'studreader';

-- Add current_role column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_role user_role NOT NULL DEFAULT 'studreader';

-- Update existing users to have current_role set to their role
UPDATE users SET current_role = role WHERE current_role IS NULL;

-- Create index for current_role if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_current_role ON users(current_role);

-- Update default role for new users
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'studreader';
ALTER TABLE users ALTER COLUMN current_role SET DEFAULT 'studreader';