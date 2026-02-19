-- User queries for repository layer

-- name: get_user_by_id
-- Get user by ID
SELECT 
    id, email, username, password, full_name, 
    role, is_active, is_verified, created_at, updated_at, 
    last_login, profile_image_url, bio
FROM users 
WHERE id = %s;

-- name: get_user_by_email
-- Get user by email
SELECT 
    id, email, username, password, full_name, 
    role, is_active, is_verified, created_at, updated_at, 
    last_login, profile_image_url, bio
FROM users 
WHERE email = %s;

-- name: get_user_by_username
-- Get user by username
SELECT 
    id, email, username, password, full_name, 
    role, is_active, is_verified, created_at, updated_at, 
    last_login, profile_image_url, bio
FROM users 
WHERE username = %s;

-- name: create_user
-- Create a new user
INSERT INTO users (email, username, password, full_name, role)
VALUES (%s, %s, %s, %s, %s)
RETURNING id, email, username, full_name, role, is_active, is_verified, created_at;

-- name: update_user
-- Update user details
UPDATE users
SET 
    full_name = COALESCE(%s, full_name),
    profile_image_url = COALESCE(%s, profile_image_url),
    bio = COALESCE(%s, bio),
    updated_at = CURRENT_TIMESTAMP
WHERE id = %s
RETURNING id, email, username, full_name, role, is_active, is_verified, created_at, updated_at;

-- name: update_last_login
-- Update user's last login timestamp
UPDATE users
SET last_login = CURRENT_TIMESTAMP
WHERE id = %s;

-- name: deactivate_user
-- Deactivate a user account
UPDATE users
SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
WHERE id = %s;

-- name: verify_user_email
-- Mark user email as verified
UPDATE users
SET is_verified = TRUE, updated_at = CURRENT_TIMESTAMP
WHERE id = %s;

-- name: get_all_users
-- Get all users with pagination
SELECT 
    id, email, username, full_name, 
    role, is_active, is_verified, created_at
FROM users
ORDER BY created_at DESC
LIMIT %s OFFSET %s;

-- name: count_users
-- Count total users
SELECT COUNT(*) as total FROM users;

-- name: check_email_exists
-- Check if email already exists
SELECT EXISTS(SELECT 1 FROM users WHERE email = %s) as exists;

-- name: check_username_exists
-- Check if username already exists
SELECT EXISTS(SELECT 1 FROM users WHERE username = %s) as exists;
