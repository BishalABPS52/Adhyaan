#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}   Adhyaan Platform - Complete Setup${NC}"
echo -e "${BLUE}============================================${NC}"

# Backend Setup
echo -e "\n${GREEN}[1/4] Setting up Backend...${NC}"
cd /home/bishal-shrestha/adhyaan/backend

# Check if virtual environment exists
if [ ! -d "../.venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv ../.venv
fi

# Activate virtual environment
source ../.venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check database connection
echo -e "\n${GREEN}[2/4] Checking Database Connection...${NC}"
psql -U postgres -d adhyaan_db -c "SELECT 1;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed. Please ensure PostgreSQL is running.${NC}"
fi

# Frontend Setup
echo -e "\n${GREEN}[3/4] Setting up Frontend...${NC}"
cd /home/bishal-shrestha/adhyaan/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
else
    echo "Node modules already installed"
fi

# Start Services
echo -e "\n${GREEN}[4/4] Starting Services...${NC}"

# Start Backend in background
echo "Starting Backend server..."
cd /home/bishal-shrestha/adhyaan/backend
source ../.venv/bin/activate
nohup python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID) - Logs: backend/backend.log${NC}"
echo -e "${BLUE}   Backend URL: http://localhost:8000${NC}"
echo -e "${BLUE}   API Docs: http://localhost:8000/docs${NC}"

# Wait a moment for backend to start
sleep 3

# Start Frontend in background
echo "Starting Frontend server..."
cd /home/bishal-shrestha/adhyaan/frontend
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID) - Logs: frontend/frontend.log${NC}"
echo -e "${BLUE}   Frontend URL: http://localhost:3000${NC}"

# Display summary
echo -e "\n${BLUE}============================================${NC}"
echo -e "${GREEN}   🎉 Adhyaan Platform is Running!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}URLs:${NC}"
echo -e "  • Frontend:    ${BLUE}http://localhost:3000${NC}"
echo -e "  • Backend API: ${BLUE}http://localhost:8000${NC}"
echo -e "  • API Docs:    ${BLUE}http://localhost:8000/docs${NC}"
echo -e "  • Admin Panel: ${BLUE}http://localhost:3000/dashboard${NC}"
echo ""
echo -e "${GREEN}Access Points:${NC}"
echo -e "  • Student Home:  ${BLUE}http://localhost:3000/home${NC}"
echo -e "  • Reader:        ${BLUE}http://localhost:3000/reader${NC}"
echo -e "  • Student:       ${BLUE}http://localhost:3000/student${NC}"
echo -e "  • Author:        ${BLUE}http://localhost:3000/dashboard${NC}"
echo ""
echo -e "${GREEN}Process IDs:${NC}"
echo -e "  • Backend PID:  $BACKEND_PID"
echo -e "  • Frontend PID: $FRONTEND_PID"
echo ""
echo -e "${BLUE}To stop services:${NC}"
echo -e "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo -e "${BLUE}To view logs:${NC}"
echo -e "  tail -f backend/backend.log"
echo -e "  tail -f frontend/frontend.log"
echo -e "\n${BLUE}============================================${NC}"
