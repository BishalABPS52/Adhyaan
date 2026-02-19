# Railway Deployment Guide

## Environment Variables to Configure

Set these environment variables in your Railway Project settings:

| Key                           | Value                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                | `postgresql://postgres:Urkdd3LTr1eP1P48@db.mrjdducwqhngwtnfcfqd.supabase.co:5432/postgres` |
| `PORT`                        | `8080`                                                                                     |
| `ALLOWED_ORIGINS`             | `https://adhyaan.vercel.app`                                                               |
| `ENVIRONMENT`                 | `production`                                                                               |
| `DEBUG`                       | `False`                                                                                    |
| `SECRET_KEY`                  | `your-secret-key-here-change-in-production`                                                |
| `ALGORITHM`                   | `HS256`                                                                                    |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30`                                                                                       |
| `BLOB_READ_WRITE_TOKEN`       | `vercel_blob_rw_Mm3zM05rG5hdcove_rnuX1m15YSpICL02bZqPbCxVLK9sX6`                           |
| `EMAIL_HOST`                  | `smtp.gmail.com`                                                                           |
| `EMAIL_PORT`                  | `465`                                                                                      |
| `EMAIL_USER`                  | `adhyaan.noreply@gmail.com`                                                                |
| `EMAIL_PASSWORD`              | `jpnupaatqaixejoo`                                                                         |
| `EMAIL_FROM`                  | `adhyaan.noreply@gmail.com`                                                                |
| `EMAIL_FROM_NAME`             | `Adhyaan`                                                                                  |

## Deployment Steps

1. Push your code to GitHub.
2. Link your GitHub repository to Railway.
3. Railway will automatically detect the Python backend and deploy it.
4. Ensure the start command is `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT` or equivalent if using FastAPI.
