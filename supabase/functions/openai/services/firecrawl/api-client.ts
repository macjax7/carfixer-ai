
import { FirecrawlResponse, FirecrawlRequestOptions } from "./types.ts";

/**
 * Client for interacting with the Firecrawl API
 */
export class FirecrawlApiClient {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Make a request to the Firecrawl API
   */
  async makeRequest(requestBody: FirecrawlRequestOptions): Promise<Response> {
    console.log(`Sending request to Firecrawl API...`);
    
    return await fetch('https://api.firecrawl.dev/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  }
  
  /**
   * Process the API response
   */
  async processResponse(response: Response): Promise<FirecrawlResponse> {
    if (!response.ok) {
      const errorText = await response.text();
      const statusCode = response.status;
      const statusMessage = response.statusText;
      
      console.error(`Firecrawl API error [${statusCode} ${statusMessage}]:`, errorText);
      
      return {
        success: false,
        error: `Firecrawl API error: ${statusCode} ${statusMessage} - ${errorText.slice(0, 200)}`
      };
    }
    
    try {
      const result = await response.json();
      console.log(`Response parsed successfully, contains ${result.pages ? result.pages.length : 0} pages`);
      
      // Validate response structure
      if (!result || !result.pages || !Array.isArray(result.pages)) {
        console.warn('Unexpected response structure from Firecrawl API');
        console.log('Response structure:', JSON.stringify(result).slice(0, 200) + '...');
        return {
          success: false,
          error: 'Unexpected response structure from Firecrawl API'
        };
      }
      
      // Check for empty content which might indicate URL was inaccessible
      if (result?.pages?.length === 0 || 
          (result?.pages?.[0]?.html === "" && result?.pages?.[0]?.markdown === "")) {
        console.warn('Firecrawl returned empty content - URL may be inaccessible');
        return {
          success: false,
          error: 'Unable to access page content. The URL may be invalid, blocked, or requires authentication.'
        };
      }
      
      return {
        success: true,
        data: result
      };
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      return {
        success: false,
        error: 'Failed to parse Firecrawl API response'
      };
    }
  }
}
