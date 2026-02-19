#!/bin/bash

# Adhyaan Backend Test Script
# Tests the backend API endpoints

BASE_URL="http://localhost:8000/api/v1"

echo "======================================"
echo "Testing Adhyaan Backend API"
echo "======================================"
echo ""

# Test 1: Health Check
echo "1. Testing Health Check..."
curl -s "${BASE_URL}/health" | jq '.'
echo ""

# Test 2: Register a new user
echo "2. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "full_name": "Test User",
    "role": "student"
  }')

echo "$REGISTER_RESPONSE" | jq '.'
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token.access_token')
echo ""

# Test 3: Login
echo "3. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token.access_token')
echo ""

# Test 4: Get Current User (Protected Route)
echo "4. Testing Protected Route (Get Current User)..."
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  curl -s -X GET "${BASE_URL}/auth/me" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
else
  echo "No token available. Skipping protected route test."
fi
echo ""

echo "======================================"
echo "Tests Complete!"
echo "======================================"
