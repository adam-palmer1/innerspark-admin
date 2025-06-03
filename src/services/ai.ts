import OpenAI from 'openai';

export interface GeneratedAffirmation {
  affirmationTitle: string;
  affirmationContent: string;
  descriptionContent: string;
  practiceContent1: string;
  practiceContent2: string;
  practiceContent3: string;
}

class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please set REACT_APP_OPENAI_API_KEY in your .env file.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async generateAffirmation(tags: string[]): Promise<GeneratedAffirmation> {
    if (!tags || tags.length === 0) {
      throw new Error('At least one tag is required to generate an affirmation');
    }

    const tagList = tags.join(', ');
    const prompt = `Create a compassionate, loving, friendly, supportive and uplifting affirmation based on the specified tags. Try to keep content practical and down to earth and avoid being high level or abstract. You should have a strong preference for starting affirmations with definitive statements such as "I am". The style should be that of Teal Swan (70%), Gabor Mate (20%) and Eckhart Tolle (10%). Here are the tags: ${tagList}

Please provide a JSON response with the following structure:
{
  "affirmationContent": "A short, inspiring title that captures the essence of the affirmation (maximum 120 characters)",
  "affirmationTitle": "An even shorter summary of the affirmation (maximum 50 characters)",
  "descriptionContent": "A longer description (up to 550 characters) that goes into more detail on the affirmation, and provides more insight. It might optionally explain how people become stuck in patterns related to the affirmation that go against their best interest. This can also use HTML paragraph tags 'p' as well as 'b' and 'i' to highlight key concepts and insights.",
  "practiceContent1": "First actionable step, daily exercise, or reflection prompt to practice this affirmation (maximum length 120 characters)",
  "practiceContent2": "Second actionable step, daily exercise, or reflection prompt to practice this affirmation (maximum length 120 characters)",
  "practiceContent3": "Third actionable step, daily exercise, or reflection prompt to practice this affirmation (maximum length 120 characters)"
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate, loving, friendly, supportive and uplifting wellness coach who creates meaningful affirmations and practical guidance for personal growth. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response received from AI service');
      }

      // Parse the JSON response
      let parsedResponse: GeneratedAffirmation;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        throw new Error('Invalid response format from AI service');
      }

      // Validate required fields
      const requiredFields = [
        'affirmationTitle', 
        'affirmationContent', 
        'descriptionContent', 
        'practiceContent1', 
        'practiceContent2', 
        'practiceContent3'
      ];
      
      for (const field of requiredFields) {
        if (!parsedResponse[field as keyof GeneratedAffirmation]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Validate title length (50 characters)
      if (parsedResponse.affirmationTitle.length > 50) {
        parsedResponse.affirmationTitle = parsedResponse.affirmationTitle.substring(0, 47) + '...';
      }

      // Validate content length (120 characters)
      if (parsedResponse.affirmationContent.length > 120) {
        parsedResponse.affirmationContent = parsedResponse.affirmationContent.substring(0, 117) + '...';
      }

      // Validate description length (550 characters)
      if (parsedResponse.descriptionContent.length > 550) {
        parsedResponse.descriptionContent = parsedResponse.descriptionContent.substring(0, 547) + '...';
      }

      // Validate practice content lengths (120 characters each)
      if (parsedResponse.practiceContent1.length > 120) {
        parsedResponse.practiceContent1 = parsedResponse.practiceContent1.substring(0, 117) + '...';
      }
      if (parsedResponse.practiceContent2.length > 120) {
        parsedResponse.practiceContent2 = parsedResponse.practiceContent2.substring(0, 117) + '...';
      }
      if (parsedResponse.practiceContent3.length > 120) {
        parsedResponse.practiceContent3 = parsedResponse.practiceContent3.substring(0, 117) + '...';
      }

      return parsedResponse;

    } catch (error: any) {
      if (error.error?.type === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing settings.');
      } else if (error.error?.type === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error.message?.includes('JSON')) {
        throw new Error('AI service returned invalid data. Please try again.');
      } else {
        throw new Error(error.message || 'Failed to generate affirmation. Please try again.');
      }
    }
  }
}

export const aiService = new AIService();