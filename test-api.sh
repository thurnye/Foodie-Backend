#!/bin/bash

# Test script for Foodie Backend API
# Run this after starting the services with: npm run dev

BASE_URL="http://localhost:3000"
AUTH_SERVICE_URL="http://localhost:3001"

echo "=== Testing Foodie Backend API ==="
echo ""

# Test health endpoints
echo "1. Testing Auth Service Health..."
curl -s $AUTH_SERVICE_URL/health | json_pp || curl -s $AUTH_SERVICE_URL/health
echo -e "\n"

echo "2. Testing API Gateway Health..."
curl -s $BASE_URL/health | json_pp || curl -s $BASE_URL/health
echo -e "\n"

# Test user registration
echo "3. Testing User Registration..."
curl -s -X POST $AUTH_SERVICE_URL/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser"
  }' | json_pp || curl -s -X POST $AUTH_SERVICE_URL/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123",
    "firstName": "Test",
    "lastName": "User",
    "username": "testuser"
  }'
echo -e "\n"

# Test user login
echo "4. Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST $AUTH_SERVICE_URL/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123"
  }')

echo $LOGIN_RESPONSE | json_pp || echo $LOGIN_RESPONSE
echo -e "\n"

echo "=== Tests Complete ==="
