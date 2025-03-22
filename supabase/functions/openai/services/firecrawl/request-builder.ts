
import { FirecrawlRequestOptions } from "./types.ts";

/**
 * Utility for building Firecrawl request configurations
 */
export class FirecrawlRequestBuilder {
  /**
   * Create a request body for vehicle listing crawl requests
   */
  static buildVehicleListingRequest(url: string): FirecrawlRequestOptions {
    console.log(`Building request configuration for URL: ${url}`);
    
    return {
      url,
      limit: 1, // We only need the listing page itself
      followRedirects: true, // Follow redirects for URL shorteners
      scrapeOptions: {
        formats: ['markdown', 'html'], // Get content in both markdown and HTML format
        // Enhanced selectors targeting common vehicle listing elements across different sites
        selector: this.getVehicleListingSelectors().join(', '),
        followLinks: false,
        waitUntil: 'networkidle0', // Wait until network is idle for more JS-heavy sites
        timeout: 30000, // Increased timeout for slower sites
        javascript: true, // Ensure JavaScript execution for dynamic content
        imagesAndCSSRequired: true, // Load images and CSS for better rendering
        scrollToBottom: true, // Scroll to load any lazy-loaded content
        extraHTTPHeaders: this.getStandardHeaders()
      }
    };
  }
  
  /**
   * Get standard HTTP headers for web crawling
   */
  private static getStandardHeaders(): Record<string, string> {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8'
    };
  }
  
  /**
   * Get selectors for vehicle listing elements
   */
  private static getVehicleListingSelectors(): string[] {
    return [
      // Vehicle details containers
      '.vehicle-details', '.listing-details', '.vehicle-info', '.vdp-content', '.vdp-details',
      // Facebook Marketplace selectors
      '[data-testid="marketplace_pdp_container"]', '.x1qjc9v5', '.x9f619', '[data-pagelet="MainFeed"]',
      // Craigslist selectors
      '#postingbody', '.attrgroup', '.mapAndAttrs', '[id^="titletextonly"]',
      // CarGurus selectors
      '.cg-listing-key-details', '.cg-listing-attributes', '.cg-listing-description', '.vin-value',
      // AutoTrader selectors
      '.first-price', '.about-section', '.vehicle-info', '.vehicle-brief', '.vehicle-details',
      // Generic selectors
      '.price', '.mileage', '.vin', '.description', '#vehicle-price',
      // Fallback to broader content if specific selectors fail
      'article', 'main', '#content', '.content', 'body'
    ];
  }
}
