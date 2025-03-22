/**
 * Service for extracting and processing content from web pages
 */
export class ContentExtractorService {
  private openAIApiKey: string;
  
  constructor(openAIApiKey: string) {
    this.openAIApiKey = openAIApiKey;
  }
  
  /**
   * Extract text content from HTML
   */
  extractTextFromHtml(html: string): string {
    // Simple function to extract text from HTML
    // Remove HTML tags but keep their content
    return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
               .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
               .replace(/<[^>]+>/g, ' ')
               .replace(/\s{2,}/g, ' ')
               .trim();
  }
  
  /**
   * Process data extracted by Firecrawl
   */
  async processFirecrawlData(crawlData: any, platform: string): Promise<any> {
    try {
      console.log('Processing Firecrawl data for', platform);
      
      // Extract texts from the page content
      const pageText = crawlData?.pages?.[0]?.content?.markdown || '';
      const pageHtml = crawlData?.pages?.[0]?.content?.html || '';
      
      console.log('Extracted text length:', pageText.length);
      if (pageText.length < 100 && pageHtml) {
        console.log('Markdown content too short, trying to extract from HTML');
        // If markdown is too short, try to extract text from HTML
        const textFromHtml = this.extractTextFromHtml(pageHtml);
        if (textFromHtml.length > pageText.length) {
          console.log('Using text extracted from HTML instead, length:', textFromHtml.length);
          return this.extractVehicleDataFromText(textFromHtml, platform);
        }
      }
      
      // Use OpenAI to extract structured vehicle data from the crawled text
      return this.extractVehicleDataFromText(pageText, platform);
    } catch (error) {
      console.error('Error processing Firecrawl data:', error);
      throw new Error('Unable to process the crawled webpage data');
    }
  }
  
  /**
   * Extract vehicle data from listing text using AI
   */
  async extractVehicleDataFromText(text: string, platform: string): Promise<any> {
    try {
      const promptText = `
Extract vehicle information from this ${platform} listing:

${text.slice(0, 8000)}  # Limit text to avoid exceeding token limits

Extract and format as JSON with these fields:
- make (string): Car manufacturer
- model (string): Car model
- year (number): Production year
- price (number): Asking price in USD without currency symbols or commas
- mileage (number): Mileage in miles without commas
- vin (string, optional): VIN if available
- description (string): Seller's description, trimmed if needed
- imageUrl (string, optional): URL to main image if found

Return ONLY the JSON with these fields, nothing else. If a field is not found in the text, omit it from the JSON.
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You extract structured vehicle listing data from text. Respond with valid JSON only.' },
            { role: 'user', content: promptText }
          ],
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const textContent = result.choices[0].message.content;
      
      // Extract JSON from the response
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from OpenAI response');
      }
      
      const data = JSON.parse(jsonMatch[0]);
      console.log('Extracted vehicle data:', data);
      
      return data;
    } catch (error) {
      console.error('Error extracting vehicle data from text:', error);
      throw error;
    }
  }
}
