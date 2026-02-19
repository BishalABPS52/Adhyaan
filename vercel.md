# Vercel Deployment Guide for Adhyaan Frontend

## Environment Variables to Configure

Set these in the Vercel Dashboard under Project Settings > Environment Variables:

| Key                       | Value                                                            |
| ------------------------- | ---------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`     | `https://adhyaan.up.railway.app/api/v1`                          |
| `NEXT_PUBLIC_BACKEND_URL` | `https://adhyaan.up.railway.app`                                 |
| `NEXT_PUBLIC_APP_NAME`    | `Adhyaan`                                                        |
| `NEXTAUTH_SECRET`         | `your-secret-key-here`                                           |
| `NEXTAUTH_URL`            | `https://adhyaan.vercel.app`                                     |
| `BLOB_READ_WRITE_TOKEN`   | `vercel_blob_rw_Mm3zM05rG5hdcove_rnuX1m15YSpICL02bZqPbCxVLK9sX6` |

## Deployment Steps

1. Push your code to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard).
3. Import your repository.
4. Set the **Root Directory** to `frontend`.
5. Add the environment variables listed above.
6. Click **Deploy**.
