-- Placeholder for books queries (for future use)

-- name: get_book_by_id
SELECT * FROM books WHERE id = %s;

-- name: get_all_books
SELECT * FROM books WHERE is_published = TRUE ORDER BY created_at DESC LIMIT %s OFFSET %s;

-- name: create_book
INSERT INTO books (title, author_id, description, category)
VALUES (%s, %s, %s, %s)
RETURNING *;
