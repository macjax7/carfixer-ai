
/**
 * Service for interacting with the Firecrawl API to extract data from web pages
 */
export class FirecrawlService {
  private apiKey: string;
  private maxRetries: number;
  
  constructor(apiKey: string, maxRetries = 2) {
    this.apiKey = apiKey;
    this.maxRetries = maxRetries;
    console.log(`FirecrawlService initialized with max retries: ${maxRetries}`);
  }
  
  /**
   * Crawl a URL and extract its content with retry logic
   */
  async crawlUrl(url: string) {
    let attempts = 0;
    
    console.log(`Starting Firecrawl extraction for URL: ${url}`);
    console.log(`Maximum retry attempts configured: ${this.maxRetries}`);
    
    while (attempts <= this.maxRetries) {
      try {
        console.log(`Attempt ${attempts + 1}/${this.maxRetries + 1} for URL: ${url}`);
        
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
        
        console.log(`Request payload configured with selectors for vehicle listings`);
        
        // Make request to Firecrawl API
        console.log(`Sending request to Firecrawl API...`);
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
          const statusCode = response.status;
          const statusMessage = response.statusText;
          
          console.error(`Firecrawl API error [${statusCode} ${statusMessage}] (Attempt ${attempts + 1}):`, errorText);
          
          // Handle specific HTTP status codes
          if (statusCode === 429) {
            console.warn('Rate limit exceeded. Waiting longer before retry...');
            await new Promise(resolve => setTimeout(resolve, 5000)); // Longer wait for rate limiting
          } else if (statusCode >= 500) {
            console.warn('Server error. Will retry shortly...');
          } else if (statusCode === 401) {
            console.error('Authentication failed. API key may be invalid or expired.');
            return {
              success: false,
              error: 'Authentication failed with Firecrawl API. Please check your API key.'
            };
          } else if (statusCode === 400) {
            console.error('Bad request. URL may be invalid or unsupported.');
          }
          
          // If this is our last attempt, return detailed error
          if (attempts === this.maxRetries) {
            console.error(`All ${this.maxRetries + 1} attempts failed for URL: ${url}`);
            return {
              success: false,
              error: `Firecrawl API error: ${statusCode} ${statusMessage} - ${errorText.slice(0, 200)}`
            };
          }
          
          // Otherwise, increment attempt counter and retry
          attempts++;
          const waitTime = 2000 * attempts; // Progressive backoff
          console.log(`Waiting ${waitTime}ms before retry attempt ${attempts + 1}...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Successful response
        console.log(`Firecrawl API response received successfully (Attempt ${attempts + 1})`);
        
        try {
          const result = await response.json();
          console.log(`Response parsed successfully, contains ${result.pages ? result.pages.length : 0} pages`);
          
          // Validate response structure
          if (!result || !result.pages || !Array.isArray(result.pages)) {
            console.warn('Unexpected response structure from Firecrawl API');
            console.log('Response structure:', JSON.stringify(result).slice(0, 200) + '...');
          }
          
          return {
            success: true,
            data: result
          };
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          if (attempts === this.maxRetries) {
            return {
              success: false,
              error: 'Failed to parse Firecrawl API response'
            };
          }
          attempts++;
          continue;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        
        console.error(`Error in Firecrawl service (Attempt ${attempts + 1}):`, errorMessage);
        console.error(`Error stack: ${errorStack}`);
        
        // If this is our last attempt, return detailed error
        if (attempts === this.maxRetries) {
          console.error(`All ${this.maxRetries + 1} attempts failed due to exceptions`);
          return {
            success: false,
            error: `Error in Firecrawl service: ${errorMessage}`
          };
        }
        
        // Otherwise, increment attempt counter and retry
        attempts++;
        const waitTime = 2000 * attempts; // Progressive backoff
        console.log(`Waiting ${waitTime}ms before retry attempt ${attempts + 1}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    // This should never be reached due to the return statements in the loop,
    // but TypeScript requires a return statement at the end of the function
    console.error('Unexpected code path reached in crawlUrl function');
    return {
      success: false,
      error: 'Maximum retry attempts exceeded'
    };
  }
}
