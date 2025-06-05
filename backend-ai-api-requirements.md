# Backend AI API Requirements

## Overview
This document outlines the requirements for implementing the AI affirmation generation functionality on the backend API server.

## API Endpoint

### Generate AI Affirmation
**Endpoint:** `POST /api/admin/affirmations/generate-ai`

**Authentication:** Required (JWT Bearer token)

**Request Body:**
```json
{
  "tags": ["string array", "required"],
  "language": "string (optional, default: 'en')"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Affirmation generated successfully",
  "data": {
    "affirmationTitle": "string (max 50 chars)",
    "affirmationContent": "string (max 120 chars)",
    "descriptionContent": "string (max 550 chars, supports HTML tags)",
    "practiceContent1": "string (max 120 chars)",
    "practiceContent2": "string (max 120 chars)",
    "practiceContent3": "string (max 120 chars)"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## OpenAI Configuration

### Environment Variables
```bash
# OpenAI API Configuration
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=800
```

### API Key Security
**IMPORTANT:** The exposed API key in the frontend was:
```
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
```

**Action Required:**
1. This key should be rotated immediately in your OpenAI account
2. Generate a new API key for backend use only
3. Never expose API keys in frontend code or commit them to version control

## AI Generation Logic

### System Prompt
```
You are a compassionate, loving, friendly, supportive and uplifting wellness coach who creates meaningful affirmations and practical guidance for personal growth. Always respond with valid JSON only.
```

### User Prompt Template
```
Create a complete affirmation based on these tags: [tags].

Requirements:
1. Affirmation should start with "I am"
2. Be practical, real, down to earth
3. Not abstract or high level
4. Written in a style that is 70% Teal Swan, 20% Gabor Mate, and 10% Eckhart Tolle

Return ONLY a JSON object with this exact structure:
{
  "affirmationTitle": "Short summary (max 50 chars)",
  "affirmationContent": "Inspiring affirmation starting with 'I am' (max 120 chars)",
  "descriptionContent": "Detailed description with <b>bold</b> and <i>italic</i> HTML tags for emphasis (max 550 chars)",
  "practiceContent1": "First actionable practice step (max 120 chars)",
  "practiceContent2": "Second actionable practice step (max 120 chars)",
  "practiceContent3": "Third actionable practice step (max 120 chars)"
}
```

### Implementation Notes

1. **Error Handling:**
   - Validate that at least one tag is provided
   - Handle OpenAI API errors (rate limits, network issues, invalid responses)
   - Parse and validate JSON response structure
   - Ensure all character limits are respected

2. **Response Validation:**
   - Verify all required fields are present
   - Check character length limits
   - Ensure affirmationContent starts with "I am"
   - Validate HTML tags in descriptionContent are properly formatted

3. **Rate Limiting:**
   - Consider implementing rate limiting to prevent abuse
   - Track usage per admin user

4. **Caching (Optional):**
   - Consider caching generated affirmations by tag combination
   - Set appropriate cache expiration (e.g., 24 hours)

## Example Implementation (Node.js/Express)

```javascript
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/admin/affirmations/generate-ai', authenticateAdmin, async (req, res) => {
  try {
    const { tags, language = 'en' } = req.body;
    
    if (!tags || tags.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one tag is required'
      });
    }

    const systemPrompt = "You are a compassionate, loving, friendly, supportive and uplifting wellness coach who creates meaningful affirmations and practical guidance for personal growth. Always respond with valid JSON only.";
    
    const userPrompt = `Create a complete affirmation based on these tags: ${tags.join(', ')}.

Requirements:
1. Affirmation should start with "I am"
2. Be practical, real, down to earth
3. Not abstract or high level
4. Written in a style that is 70% Teal Swan, 20% Gabor Mate, and 10% Eckhart Tolle

Return ONLY a JSON object with this exact structure:
{
  "affirmationTitle": "Short summary (max 50 chars)",
  "affirmationContent": "Inspiring affirmation starting with 'I am' (max 120 chars)",
  "descriptionContent": "Detailed description with <b>bold</b> and <i>italic</i> HTML tags for emphasis (max 550 chars)",
  "practiceContent1": "First actionable practice step (max 120 chars)",
  "practiceContent2": "Second actionable practice step (max 120 chars)",
  "practiceContent3": "Third actionable practice step (max 120 chars)"
}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '800'),
    });

    const responseText = completion.choices[0].message.content;
    let generatedContent;
    
    try {
      generatedContent = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText);
      throw new Error('Invalid response format from AI');
    }

    // Validate response structure and limits
    const requiredFields = ['affirmationTitle', 'affirmationContent', 'descriptionContent', 'practiceContent1', 'practiceContent2', 'practiceContent3'];
    for (const field of requiredFields) {
      if (!generatedContent[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Enforce character limits
    if (generatedContent.affirmationTitle.length > 50) {
      generatedContent.affirmationTitle = generatedContent.affirmationTitle.substring(0, 50);
    }
    if (generatedContent.affirmationContent.length > 120) {
      generatedContent.affirmationContent = generatedContent.affirmationContent.substring(0, 120);
    }
    if (generatedContent.descriptionContent.length > 550) {
      generatedContent.descriptionContent = generatedContent.descriptionContent.substring(0, 550);
    }
    if (generatedContent.practiceContent1.length > 120) {
      generatedContent.practiceContent1 = generatedContent.practiceContent1.substring(0, 120);
    }
    if (generatedContent.practiceContent2.length > 120) {
      generatedContent.practiceContent2 = generatedContent.practiceContent2.substring(0, 120);
    }
    if (generatedContent.practiceContent3.length > 120) {
      generatedContent.practiceContent3 = generatedContent.practiceContent3.substring(0, 120);
    }

    res.json({
      success: true,
      message: 'Affirmation generated successfully',
      data: generatedContent
    });

  } catch (error) {
    console.error('AI generation error:', error);
    
    let errorMessage = 'Failed to generate affirmation';
    if (error.code === 'insufficient_quota') {
      errorMessage = 'AI service quota exceeded. Please try again later.';
    } else if (error.code === 'rate_limit_exceeded') {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
});
```

## Frontend Integration

Once the backend endpoint is implemented, update the frontend to call the new API endpoint:

```javascript
// In api.ts or similar service file
async generateAIAffirmation(tags: string[]): Promise<GenerateAIResponse> {
  const response = await axios.post('/api/admin/affirmations/generate-ai', { tags });
  return response.data;
}
```

Then in the Affirmations component, replace the direct OpenAI call with the API call.