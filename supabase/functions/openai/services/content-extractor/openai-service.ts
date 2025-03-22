
/**
 * Service for making requests to OpenAI API for content extraction
 */
export class OpenAIService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Send a prompt to OpenAI and get structured vehicle data
   */
  async extractStructuredData(promptText: string): Promise<any> {
    try {
      console.log('Sending vehicle data extraction prompt to OpenAI');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You extract structured vehicle listing data from text. Respond with valid JSON only. Be precise and extract exactly what is in the text without making up information. If information is not clearly present, do not include that field in the JSON.' },
            { role: 'user', content: promptText }
          ],
          temperature: 0.1, // Lower temperature for more consistent results
          response_format: { type: "json_object" } // Request JSON format explicitly
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const textContent = result.choices[0].message.content;
      
      console.log('Successfully received OpenAI response');
      return textContent;
    } catch (error) {
      console.error('Error in OpenAI service:', error);
      throw error;
    }
  }
}
