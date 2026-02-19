# Adhyaan Backend Setup Guide

## Database Setup

### 1. Create Database Tables

First, run the main tables creation script:

```bash
psql -U your_username -d adhyaan_db -f scripts/create_tables.sql
```

### 2. Run Author Activation Schema

Execute the author activation system schema:

```bash
psql -U your_username -d adhyaan_db -f scripts/author_activation_schema.sql
```

### 3. Pre-activate Test User

Activate the specified user account (bs426808@gmail.com):

```bash
psql -U your_username -d adhyaan_db -f scripts/activate_user.sql
```

### 4. (Optional) Seed Test Data

Load sample data for testing:

```bash
psql -U your_username -d adhyaan_db -f scripts/seed_data.sql
```

## File Upload Directories

Create required upload directories:

```bash
mkdir -p uploads/documents
mkdir -p uploads/books
mkdir -p uploads/covers
chmod -R 755 uploads
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file in the backend directory with:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/adhyaan_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload Settings (already in config.py)
UPLOAD_DIR=uploads
MAX_FILE_SIZE=52428800
ALLOWED_EXTENSIONS=pdf,docx,jpg,png,doc
```

## Run Server

```bash
# Development
uvicorn app.main:app --reload

# Or use the start script
chmod +x start.sh
./start.sh
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Author Activation System Endpoints

### Student/Public Endpoints
- `POST /api/v1/author-activation/activate` - Submit activation request with KYC
- `GET /api/v1/author-activation/status` - Check your activation status
- `GET /api/v1/books/` - Browse all books
- `GET /api/v1/books/search?q=query` - Search books
- `GET /api/v1/books/random` - Get random book suggestion

### Author Endpoints (require author_approved = true)
- `POST /api/v1/author/indie` - Upload indie book
- `POST /api/v1/author/academic` - Upload academic book
- `GET /api/v1/author/dashboard/stats` - Get dashboard analytics
- `GET /api/v1/author/my-books` - List your books
- `PUT /api/v1/author/{book_id}` - Update book
- `DELETE /api/v1/author/{book_id}` - Delete book

### Admin Endpoints (require role = 'admin')
- `GET /api/v1/admin/activation-requests` - List pending requests
- `POST /api/v1/admin/activation-requests/{id}/approve` - Approve request
- `POST /api/v1/admin/activation-requests/{id}/reject` - Reject request

### User Endpoints
- `POST /api/v1/users/switch-role` - Switch between student/author role
- `GET /api/v1/users/profile` - Get user profile

## File Upload Guidelines

### Document Types (KYC)
- National ID (NID)
- Citizenship Certificate
- Driver's License  
- Teacher ID Card

### Book Files
- Formats: PDF, DOCX, DOC
- Max Size: 50MB

### Cover Images
- Formats: JPG, PNG
- Max Size: 50MB
- Recommended: 800x1200px

## Book Types

### Indie Books
Required fields:
- title, author, publication_date
- genre, isbn (optional)
- language, page_count, description

### Academic Books
Required fields:
- title, board, class, subject
- chapter_name, topic
- Either: (year AND part) OR semester
- Auto-calculates semester from year/part if not provided

## Testing

```bash
# Test API endpoints
chmod +x scripts/test_api.sh
./scripts/test_api.sh

# Manual test flow:
# 1. Register user
# 2. Login to get token
# 3. Submit activation request with documents
# 4. Admin approves request
# 5. User switches to author role
# 6. Author uploads books
# 7. Students browse books
```

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in DATABASE_URL
- Test connection: `psql -U username -d adhyaan_db`

### File Upload Issues
- Ensure upload directories exist and have write permissions
- Check file size is under MAX_FILE_SIZE (50MB)
- Verify file extension is in ALLOWED_EXTENSIONS

### Author Activation Not Working
- Verify author_activation_schema.sql was executed successfully
- Check user's author_approved status: `SELECT author_approved FROM users WHERE email = 'email@example.com';`
- Confirm role switching: `SELECT current_role FROM users WHERE email = 'email@example.com';`

### Admin Access
- Update user role to admin: `UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';`
