#!/bin/bash

# Test script for OpenAI API
# Replace with your actual API key
API_KEY="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"

echo "Testing OpenAI API with a simple completion request..."
echo "API Key: ${API_KEY:0:10}..."
echo

# Test curl request to OpenAI API
curl -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant that creates affirmations. Respond with valid JSON only."
      },
      {
        "role": "user",
        "content": "Create a short affirmation for the tags: confidence, self-love. Respond with JSON: {\"affirmationTitle\": \"title here\", \"affirmationContent\": \"content here\"}"
      }
    ],
    "max_tokens": 150,
    "temperature": 0.7
  }'

echo
echo
echo "If you see a quota exceeded error, you need to:"
echo "1. Check your OpenAI billing settings at: https://platform.openai.com/account/billing"
echo "2. Add payment method if needed"
echo "3. Verify your usage limits at: https://platform.openai.com/account/usage"