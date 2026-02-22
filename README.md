

<p align="center">
  <img src="images/adhyaan.png" alt="Adhyaan Logo" width="200"/>
</p>

<p align="center">
  <strong>Adhyaan – Study and Learn</strong><br>
  A Digital and e-Learning Platform 
</p>

<p align="center">
  Live at: <a href="https://adhyaan.vercel.app">https://adhyaan.vercel.app</a>
</p>

---

## About

Adhyaan is a digital library and e-learning platform built specifically for Students and Readers. It gives students and readers a single place to access both academic books organized by board, course, year, semester, and subject — and indie books organized by genre and author. Authors can publish and manage their own content.

---

## Screenshots

### Landing Page
![Landing Page](images/landingpage.png)

### Home Page
![Reader's Section](images/readers-section.png)

### Author Dashboard
![Home Page](images/home.png)

### Student Section 
![Student Section](images/student-section.png)

### Reader's Section
![All Books](images/all-books.png)

### All Books
![Indie Books](images/indie-books.png)

### Search
![Search](images/search.png)

### Reader Search Section
![Reader Search](images/reader-search.png)

### Student Search Section
![Student Search](images/student-search.png)
---

## Key Features

### For Students and Readers
- Browse academic books by board, course, year, semester, and subject
- Browse indie books by genre and author
- Read books directly in the browser with a built-in PDF viewer
- Search across all content by title, subject, or author

### For Authors
- Upload academic or indie books in PDF or DOCX format with cover image
- Dashboard view with total books, readers, ratings, and reviews

---

## Tech Stack

| Layer | Technology | Hosted On |
|---|---|---|
| Frontend | <img src="https://img.shields.io/badge/React-%2361DAFB.svg?style=for-the-badge&logo=react&logoColor=black" height="30"> <img src="https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white" height="30"> <img src="https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" height="30"> | <img src="https://img.shields.io/badge/Vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" height="30"> |
| Backend | <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" height="30"> <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" height="30"> | <img src="https://img.shields.io/badge/Railway-%230B0D0E.svg?style=for-the-badge&logo=railway&logoColor=white" height="30"> |
| Database | <img src="https://img.shields.io/badge/PostgreSQL-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" height="30"> | <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=black" height="30"> |
| File Storage | <img src="https://img.shields.io/badge/Vercel%20Blob-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" height="30"> | <img src="https://img.shields.io/badge/Vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white" height="30"> |
| Email | <img src="https://img.shields.io/badge/Gmail%20API-EA4335?style=for-the-badge&logo=gmail&logoColor=white" height="30"> | <img src="https://img.shields.io/badge/Google%20Cloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white" height="30"> |

## Project Structure

```
bishalabps52-adhyaan/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Route handlers (auth, books, author, admin)
│   │   ├── core/            # Config, database, security
│   │   ├── db/repositories/ # Database repositories
│   │   ├── schemas/         # Pydantic models
│   │   ├── services/        # Auth and Services logic (auth, email)
│   │   └── utils/           # File upload, Vercel Blob
│   └── scripts/             # DB migrations and seed data
└── frontend/
    └── src/
        ├── app/
        │   ├── (public)/    # Landing page
        │   ├── (student)/   # Home, books, search, student section
        │   ├── (author)/    # Author dashboard
        │   ├── admin/       # Admin panel
        │   └── auth/        # Login, register, reset password
        ├── components/      # BookCard, PDFViewer, Navbar, etc.
        ├── hooks/           # useAuth, useRole, useTheme
        └── services/        # API service layer
```

---

## User Roles

**Student / Reader** – The default role. Browse and read all books on the platform, track progress, and leave ratings.

**Author** – Upload and manage books, view engagement statistics, and reach readers across Nepal.

Users can switch between student and author modes from their profile without needing a separate account if author mode is approved.

---

## Coming Soon

- Study Rooms – collaborative reading and discussion spaces for groups
- Author activation via document verification
- Community features

---

### Database Tables ER Diagram (There may be Error) 
![ER Diagram](images/erdiagram.png)

---
