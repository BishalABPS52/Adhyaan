#!/bin/bash
cd "$(dirname "$0")"
source venv/bin/activate
echo "Starting Adhyaan Backend..."
echo "API will be available at: http://localhost:8000"
echo "API Docs at: http://localhost:8000/api/docs"
echo ""
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
