# Adhyaan Database Schema (ER Diagram)

This Mermaid diagram shows the relations between tables in the Adhyaan database.

```mermaid
erDiagram
    USERS ||--o{ ACADEMIC_BOOKS : "uploads"
    USERS ||--o{ INDIE_BOOKS : "uploads"
    USERS ||--o{ BOOK_RATINGS : "gives"
    USERS ||--o{ BOOK_READERS : "reads"
    ACADEMIC_BOOKS ||--o{ BOOK_RATINGS : "has"
    ACADEMIC_BOOKS ||--o{ BOOK_READERS : "has"
    INDIE_BOOKS ||--o{ BOOK_RATINGS : "has"
    INDIE_BOOKS ||--o{ BOOK_READERS : "has"

    USERS {
        uuid id PK
        string username
        string email
        string hashed_password
        string full_name
        string role "READER/AUTHOR"
        boolean is_active
        timestamp created_at
    }

    ACADEMIC_BOOKS {
        uuid id PK
        string board
        string book_name
        string course_name
        string level "school/university/etc"
        int year
        int semester
        string subject
        string file_path
        uuid uploaded_author_id FK
        float rating
        int reader_count
        timestamp created_at
    }

    INDIE_BOOKS {
        uuid id PK
        string title
        string author_name
        string genre
        string description
        string file_path
        uuid uploaded_author_id FK
        float rating
        int reader_count
        timestamp created_at
    }

    BOOK_RATINGS {
        uuid id PK
        uuid book_id FK "UNIQUE with user_id"
        uuid user_id FK "UNIQUE with book_id"
        int rating "1-5"
        text review
        timestamp created_at
        timestamp updated_at
    }

    BOOK_READERS {
        uuid id PK
        uuid book_id FK "UNIQUE with user_id"
        uuid user_id FK "UNIQUE with book_id"
        boolean is_completed "Default FALSE"
        timestamp last_read_at
        timestamp created_at
    }
```

### Data Integrity Features

1. **Idempotent Reading Tracking**: When a user opens a book, a record is created in `BOOK_READERS`. If it already exists, only `last_read_at` is updated. `is_completed` remains untouched until explicitly toggled.
2. **Single Rating Policy**: Each user can only provide ONE rating per book. Subsequent ratings from the same user will update their existing record in `BOOK_RATINGS` rather than creating duplicates.
3. **Persistent Read Status**: Once `is_completed` is set to `TRUE`, it stays `TRUE` across all future sessions for that specific user and book.

### Paste this into draw.io (Mermaid format):

In draw.io, go to **Arrange > Insert > Advanced > Mermaid...** and paste the code above.
