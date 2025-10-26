#!/bin/bash

# Test script for Recipe Service
# Run after starting: npm run dev

BASE_URL="http://localhost:3003"
RECIPE_SERVICE_URL="http://localhost:3003"

echo "=== Testing Recipe Service ==="
echo ""

# Test health endpoint
echo "1. Testing Recipe Service Health..."
curl -s $RECIPE_SERVICE_URL/health | json_pp || curl -s $RECIPE_SERVICE_URL/health
echo -e "\n"

# Test listing recipes
echo "2. Testing List All Recipes..."
curl -s -X POST $RECIPE_SERVICE_URL/api/recipe \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 5
  }' | json_pp || curl -s -X POST $RECIPE_SERVICE_URL/api/recipe \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "limit": 5}'
echo -e "\n"

# Test search with filters
echo "3. Testing Recipe Search with Filters..."
curl -s -X POST $RECIPE_SERVICE_URL/api/recipe/query \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 5,
    "sortBy": "averageRating",
    "sortOrder": "desc"
  }' | json_pp || curl -s -X POST $RECIPE_SERVICE_URL/api/recipe/query \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "limit": 5, "sortBy": "averageRating", "sortOrder": "desc"}'
echo -e "\n"

echo "=== Recipe Service Tests Complete ==="
echo ""
echo "To test full CRUD operations, you need:"
echo "1. A valid user ID to create recipes"
echo "2. An access token to add reviews"
echo ""
echo "Example create recipe:"
echo 'curl -X POST http://localhost:3003/api/recipe/add/USER_ID -H "Content-Type: application/json" -d @sample-recipe.json'
