
/**
 * Service for interacting with the Firecrawl API to extract data from web pages
 */
export class FirecrawlService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  /**
   * Crawl a URL and extract its content
   */
  async crawlUrl(url: string) {
    try {
      console.log(`Starting Firecrawl crawl for URL: ${url}`);
      
      // Configure the crawl request
      const requestBody = {
        url,
        limit: 1, // We only need the listing page itself
        scrapeOptions: {
          formats: ['markdown'], // Get text content in markdown format
        }
      };
      
      // Make request to Firecrawl API
      const response = await fetch('https://api.firecrawl.dev/crawl', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Firecrawl API error:', errorText);
        return {
          success: false,
          error: `Firecrawl API error: ${response.status} ${response.statusText}`
        };
      }
      
      const result = await response.json();
      console.log('Firecrawl crawl successful');
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error in Firecrawl service:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in Firecrawl service'
      };
    }
  }
}
