
/**
 * Service for interacting with OpenAI API
 */
export class OpenAIApiService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Call OpenAI API to analyze vehicle data
   */
  async analyzeVehicle(promptText: string): Promise<any> {
    console.log('Sending vehicle analysis prompt to OpenAI');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert automotive analyst specializing in used car evaluations. You MUST only provide analysis based on explicitly provided vehicle details. Never invent or substitute information not present in the listing. If critical information is missing, acknowledge these limitations and explain how they impact your analysis. Your priority is accuracy, not comprehensiveness when data is insufficient.' 
          },
          { role: 'user', content: promptText }
        ],
        temperature: 0.2, // Lower temperature for more factual, less creative responses
        response_format: { type: "json_object" } // Request JSON format explicitly
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  }
}
