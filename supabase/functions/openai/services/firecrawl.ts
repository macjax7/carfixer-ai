
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
        
        // Configure the crawl request with improved selectors for vehicle listings
        const requestBody = {
          url,
          limit: 1, // We only need the listing page itself
          scrapeOptions: {
            formats: ['markdown', 'html'], // Get content in both markdown and HTML format
            // Enhanced selectors targeting common vehicle listing elements across different sites
            selector: [
              // Vehicle details containers
              '.vehicle-details', '.listing-details', '.vehicle-info', '.vdp-content', '.vdp-details',
              // Facebook Marketplace selectors
              '[data-testid="marketplace_pdp_container"]', '.x1qjc9v5', '.x9f619',
              // Craigslist selectors
              '#postingbody', '.attrgroup', '.mapAndAttrs',
              // CarGurus selectors
              '.cg-listing-key-details', '.cg-listing-attributes', '.cg-listing-description',
              // AutoTrader selectors
              '.first-price', '.about-section', '.vehicle-info',
              // Generic selectors
              '.price', '.mileage', '.vin', '.description',
              // Fallback to broader content if specific selectors fail
              'article', 'main', '#content', '.content'
            ].join(', '),
            followLinks: false,
            waitUntil: 'networkidle0', // Wait until network is idle for more JS-heavy sites
            timeout: 30000, // Increased timeout for slower sites
            javascript: true, // Ensure JavaScript execution for dynamic content
            imagesAndCSSRequired: true, // Load images and CSS for better rendering
            scrollToBottom: true, // Scroll to load any lazy-loaded content
            extraHTTPHeaders: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
            }
          }
        };
        
        console.log(`Request payload configured with enhanced selectors for vehicle listings`);
        
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
  
  /**
   * Attempt to extract the main vehicle image URL from HTML content
   */
  extractMainImageUrl(htmlContent: string): string | null {
    try {
      // Common patterns for vehicle listing images
      const imgPatterns = [
        /<meta\s+property="og:image"\s+content="([^"]+)"/i,
        /<meta\s+content="([^"]+)"\s+property="og:image"/i,
        /<img[^>]+class="[^"]*(?:main-image|primary-image|hero-image|gallery-image|carousel-image)[^"]*"[^>]+src="([^"]+)"/i,
        /<img[^>]+id="[^"]*(?:main-image|primary-image|hero|main-photo)[^"]*"[^>]+src="([^"]+)"/i,
        /<img[^>]+src="([^"]+(?:jpg|jpeg|png|webp))"[^>]+(?:alt="[^"]*(?:vehicle|car|truck|auto)[^"]*"|class="[^"]*(?:vehicle|car|truck|auto)[^"]*")/i,
        // Facebook Marketplace specific patterns
        /<div[^>]+class="[^"]*(?:x1rg5ohu|x1n2onr6)[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
        // Craigslist specific patterns
        /<div[^>]+id="thumbs"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/i
      ];
      
      for (const pattern of imgPatterns) {
        const match = htmlContent.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      // Fallback: try to find any reasonably sized image
      const imgTagRegex = /<img[^>]+src="([^"]+(?:jpg|jpeg|png|webp))"[^>]+(?:width=["'](\d+)["']|height=["'](\d+)["'])/gi;
      let match;
      const imgCandidates = [];
      
      while ((match = imgTagRegex.exec(htmlContent)) !== null) {
        const width = match[2] ? parseInt(match[2], 10) : 0;
        const height = match[3] ? parseInt(match[3], 10) : 0;
        
        // Only consider reasonably sized images
        if (width > 300 || height > 300) {
          imgCandidates.push({
            url: match[1],
            size: width * height
          });
        }
      }
      
      // Sort by size (descending) and take the largest
      if (imgCandidates.length > 0) {
        imgCandidates.sort((a, b) => b.size - a.size);
        return imgCandidates[0].url;
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting image URL:', error);
      return null;
    }
  }
}
