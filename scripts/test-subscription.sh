#!/bin/bash

# Test script for newsletter subscription

echo "🧪 Testing newsletter subscription..."
echo ""

# Generate a random test email
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_${TIMESTAMP}@example.com"
TEST_NAME="Test User"

echo "📧 Subscribing with:"
echo "  Email: ${TEST_EMAIL}"
echo "  Name: ${TEST_NAME}"
echo ""

# Make the API call
RESPONSE=$(curl -s -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"firstName\": \"${TEST_NAME}\"
  }")

echo "📬 Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Subscription successful!"
  echo ""
  echo "📊 Check your inbox:"
  echo "  1. ${TEST_EMAIL} should receive a welcome email"
  echo "  2. wesleybentura@gmail.com should receive a notification"
  echo ""
  echo "📂 Check the subscriber list:"
  echo "  cat data/newsletter-subscribers.json | jq"
else
  echo "❌ Subscription failed!"
  echo "Check the server logs for more details."
fi
