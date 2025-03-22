import { FirecrawlResponse } from "./types.ts";
import { FirecrawlApiClient } from "./api-client.ts";
import { FirecrawlRequestBuilder } from "./request-builder.ts";
import { ImageExtractorUtil } from "./image-extractor.ts";

/**
 * Service for interacting with the Firecrawl API to extract data from web pages
 */
export class FirecrawlService {
  private apiClient: FirecrawlApiClient;
  private maxRetries: number;
  
  constructor(apiKey: string, maxRetries = 2) {
    this.apiClient = new FirecrawlApiClient(apiKey);
    this.maxRetries = maxRetries;
    console.log(`FirecrawlService initialized with max retries: ${maxRetries}`);
  }
  
  /**
   * Crawl a URL and extract its content with retry logic
   */
  async crawlUrl(url: string): Promise<FirecrawlResponse> {
    let attempts = 0;
    
    console.log(`Starting Firecrawl extraction for URL: ${url}`);
    console.log(`Maximum retry attempts configured: ${this.maxRetries}`);
    
    while (attempts <= this.maxRetries) {
      try {
        console.log(`Attempt ${attempts + 1}/${this.maxRetries + 1} for URL: ${url}`);
        
        // Configure the crawl request with improved selectors for vehicle listings
        const requestBody = FirecrawlRequestBuilder.buildVehicleListingRequest(url);
        
        // Make request to Firecrawl API
        const response = await this.apiClient.makeRequest(requestBody);
        
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
        
        // Process the response
        return await this.apiClient.processResponse(response);
        
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
  
  /**
   * Attempt to extract the main vehicle image URL from HTML content
   */
  extractMainImageUrl(htmlContent: string): string | null {
    return ImageExtractorUtil.extractMainImageUrl(htmlContent);
  }
}
