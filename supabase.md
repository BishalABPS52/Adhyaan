# Supabase Database Setup for Adhyaan

This guide explains how to set up a Supabase PostgreSQL database and connect it to the Adhyaan backend.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in.
2. Click **"New Project"**.
3. Select your Organization and Enter Project Name (`adhyaan-db`).
4. Set a strong **Database Password** (save this!).
5. Select your region and click **"Create New Project"**.

## 2. Get Connection Details

1. Once the project is ready, go to **Project Settings** -> **Database**.
2. Find the **Connection string** section.
3. Switch to **URI** or **Parameters** to get the host, user, and port details.

## 3. Configure Backend Environment

Update your `.env` file in the root directory (or `backend/` as per setup) with your Supabase credentials:

```env
DATABASE_HOST=db.xxxxxxxxxxxxxxxxxxxx.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USER=postgres
DATABASE_PASSWORD=your_supabase_password
```

## 4. Run Migrations / Initialize Schema

You need to create the tables in Supabase. You can use the `database_schema.md` as a reference or run your initialization scripts.

If you have a SQL script, go to the **SQL Editor** in Supabase and paste it there to run.

### Key Tables to Initialize:

- `users` (with email, role, etc.)
- `academic_books`
- `indie_books`
- `book_ratings`
- `book_readers`
- `courses`

## 5. Seed Initial Data

The project includes a seeding script for courses and boards. Once your database is connected, run:

```bash
# Ensure you are in the root directory
python seed_courses.py
```

## 6. Helpful Tips

- **Realtime**: You can enable Realtime for tables if you want live updates on reader counts or ratings.
- **Backups**: Supabase handles automatic backups daily.
- **Direct Access**: Use the **Table Editor** in the Supabase dashboard to manually edit or view data during development.
