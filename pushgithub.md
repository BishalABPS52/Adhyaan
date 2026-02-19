# Adhyaan - Project Build and GitHub Push Guide

Follow these steps to build the project and push your latest changes to GitHub.

## 1. Build the Frontend

Before pushing, ensure the Next.js frontend builds correctly to catch any production errors.

```bash
# Navigate to frontend directory
cd frontend

# Build the project
npm run build
```

## 2. Build/Verify the Backend

Ensure all dependencies are correct and the FastAPI server starts without errors.

```bash
# Navigate to backend directory
cd backend

# Ensure virtual environment is active
source ../.venv/bin/activate

# Check for any missing dependencies
pip install -r requirements.txt
```

## 3. Push to GitHub

Sync your local changes with the remote repository.

```bash
# Navigate to the root folder (adhyaan)
# Check status
git status

# Add all changes
git add .

# Commit your changes
git commit -m "feat: [describe your changes here]"

# Push to the main branch
git push origin main
```

**Repository URL**: [https://github.com/BishalABPS52/Adhyaan](https://github.com/BishalABPS52/Adhyaan)

## 4. Troubleshooting

- If you get a **lint error** during build, fix the code before pushing.
- If you get a **permission denied** error on push, check your GitHub SSH/Access Token settings.
- If there are **merge conflicts**, pull the latest changes first: `git pull origin main`.
