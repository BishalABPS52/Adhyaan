#!/bin/bash

echo "🚀 Starting Adhyaan Backend Server..."
echo "====================================="
echo ""

# Navigate to backend directory
cd /home/bishal-shrestha/adhyaan/backend

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo "📦 Activating virtual environment..."
    source ../venv/bin/activate || source venv/bin/activate
fi

# Install dependencies if needed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
fi

echo ""
echo "✅ Starting FastAPI server..."
echo "   Backend URL: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""

# Start the server with correct module path
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
