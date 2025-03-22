/**
 * Service for interacting with the Firecrawl API to extract data from web pages
 */
export class FirecrawlService {
  private apiKey: string;
  private maxRetries: number;
  
  constructor(apiKey: string, maxRetries = 2) {
    this.apiKey = apiKey;
    this.maxRetries = maxRetries;
  }
  
  /**
   * Crawl a URL and extract its content with retry logic
   */
  async crawlUrl(url: string) {
    let attempts = 0;
    
    while (attempts <= this.maxRetries) {
      try {
        console.log(`Attempting Firecrawl for URL: ${url} (Attempt ${attempts + 1}/${this.maxRetries + 1})`);
        
        // Configure the crawl request
        const requestBody = {
          url,
          limit: 1, // We only need the listing page itself
          scrapeOptions: {
            formats: ['markdown', 'html'], // Get content in both markdown and HTML format
            selector: '.vehicle-details, .listing-details, .vehicle-info, .listing-content, .marketplace-item', // Common selectors for vehicle listings
            followLinks: false, // Don't follow links on the page
            waitUntil: 'networkidle0', // Wait until network is idle (improves success with JS-heavy sites)
            timeout: 15000, // 15 second timeout
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
          console.error(`Firecrawl API error (Attempt ${attempts + 1}):`, errorText);
          
          // If this is our last attempt, return error
          if (attempts === this.maxRetries) {
            return {
              success: false,
              error: `Firecrawl API error: ${response.status} ${response.statusText}`
            };
          }
          
          // Otherwise, increment attempt counter and retry
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
          continue;
        }
        
        const result = await response.json();
        console.log('Firecrawl crawl successful');
        
        return {
          success: true,
          data: result
        };
      } catch (error) {
        console.error(`Error in Firecrawl service (Attempt ${attempts + 1}):`, error);
        
        // If this is our last attempt, return error
        if (attempts === this.maxRetries) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error in Firecrawl service'
          };
        }
        
        // Otherwise, increment attempt counter and retry
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
      }
    }
    
    // This should never be reached due to the return statements in the loop,
    // but TypeScript requires a return statement at the end of the function
    return {
      success: false,
      error: 'Maximum retry attempts exceeded'
    };
  }
}
