-- Insert sample users for testing

INSERT INTO users (email, username, password, full_name, role, is_verified) VALUES
('student@example.com', 'student1', 'password123', 'John Student', 'studreader', TRUE),
('author@example.com', 'author1', 'password123', 'Jane Author', 'author', TRUE),
('admin@example.com', 'admin1', 'password123', 'Admin User', 'admin', TRUE);

SELECT 'Database seeded successfully!' as message;
