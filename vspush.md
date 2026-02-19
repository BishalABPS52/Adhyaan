# VS Code Push Guide — Step by Step

## What was configured

- **`backend/.env`** → Production settings (Railway port 8080, Supabase DB URL, CORS pointing to Vercel)
- **`backend/Procfile`** → Tells Railway how to start the server
- **`frontend/.env.local`** → Points API URL to Railway backend
- **`frontend/src/**`** → All hardcoded `localhost:8000`URLs replaced with`NEXT_PUBLIC_API_URL` env var
- **`.gitignore`** → Fixed (removed `*.md` rule that was blocking guide files)
- **Build** → `npm run build` completed successfully ✅

> 🔐 `.env` files are excluded from git by `.gitignore` — set them manually in Railway & Vercel dashboards.

---

## Step 1: Open the Integrated Terminal

Press `` Ctrl + ` `` in VS Code.

Navigate into the project folder:

```bash
cd /home/bishal-shrestha/adhyaan
```

---

## Step 2: Set Remote Origin (First Time Only)

Since this is a fresh git repo, link it to your GitHub repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

> Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub details.

---

## Step 3: Stage All Files

```bash
git add .
```

---

## Step 4: Initial Commit

```bash
git commit -m "feat: initial commit — production config for Railway and Vercel"
```

---

## Step 5: Push to GitHub

```bash
git push -u origin master
```

> If your branch is named `main`, use: `git push -u origin main`

---

## Step 6: Configure Environment Variables (Critical!)

### On Railway (Backend)

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project → **Variables**
3. Add all variables from `rail.md`

### On Vercel (Frontend)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings → Environment Variables**
3. Add all variables from `vercel.md`

---

## Step 7: Verify Deployment

- **Backend health check**: https://adhyaan.up.railway.app/health
- **Frontend**: https://adhyaan.vercel.app

---

## For Subsequent Pushes

After the first push, future pushes are simpler:

```bash
git add .
git commit -m "your message here"
git push
```
