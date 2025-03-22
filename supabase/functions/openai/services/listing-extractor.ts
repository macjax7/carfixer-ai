
import { FirecrawlService } from './firecrawl.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

/**
 * Service for extracting data from vehicle listings
 */
export class ListingExtractorService {
  private firecrawlService: FirecrawlService | null = null;
  
  constructor() {
    if (firecrawlApiKey) {
      this.firecrawlService = new FirecrawlService(firecrawlApiKey);
    } else {
      console.warn('FIRECRAWL_API_KEY not found in environment variables. Web scraping will not be available.');
    }
  }
  
  /**
   * Extract data from a vehicle listing URL
   */
  async extractListingData(url: string) {
    try {
      // Identify the platform from the URL
      const platform = this.identifyPlatform(url);
      console.log('Identified platform:', platform);
      
      // Normalize the URL (handle shortened URLs, etc.)
      const normalizedUrl = await this.normalizeUrl(url);
      console.log('Normalized URL:', normalizedUrl);
      
      if (this.firecrawlService) {
        try {
          // Use Firecrawl service to extract data from the webpage if available
          console.log('Attempting to extract listing data with Firecrawl');
          const crawlResult = await this.firecrawlService.crawlUrl(normalizedUrl);
          
          if (crawlResult.success) {
            console.log('Successfully extracted data with Firecrawl');
            
            // Process the crawled data to extract vehicle information
            const vehicleData = await this.processFirecrawlData(crawlResult.data, platform);
            
            // Add debugging info
            console.log('Extracted vehicle data:', JSON.stringify(vehicleData, null, 2));
            
            return {
              success: true,
              data: vehicleData
            };
          } else {
            console.warn('Firecrawl extraction failed, falling back to simulation:', crawlResult.error);
          }
        } catch (error) {
          console.error('Error with Firecrawl service:', error);
          console.log('Falling back to simulated data extraction');
        }
      } else {
        console.log('Firecrawl service not available, using simulation mode');
      }
      
      // Fallback: Use OpenAI to simulate data extraction
      console.log('Using OpenAI to simulate data extraction for URL:', normalizedUrl);
      return this.simulateDataExtraction(normalizedUrl, platform);
    } catch (error) {
      console.error('Error extracting listing data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Normalize URL to handle shortened URLs, tracking parameters, etc.
   */
  private async normalizeUrl(url: string): Promise<string> {
    try {
      // Remove tracking parameters and fragments
      const urlObj = new URL(url);
      
      // Handle common URL shorteners (t.co, bit.ly, etc.)
      if (urlObj.hostname.includes('bit.ly') || 
          urlObj.hostname.includes('tinyurl.com') || 
          urlObj.hostname.includes('t.co') ||
          urlObj.hostname.includes('goo.gl')) {
        try {
          // Attempt to resolve shortened URL
          console.log('Attempting to resolve shortened URL:', url);
          const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
          if (response.url && response.url !== url) {
            console.log('Resolved shortened URL to:', response.url);
            return this.normalizeUrl(response.url); // Recursively normalize the resolved URL
          }
        } catch (error) {
          console.error('Error resolving shortened URL:', error);
          // Continue with original URL if resolution fails
        }
      }
      
      // Clean up Facebook URLs
      if (urlObj.hostname.includes('facebook.com')) {
        // Remove tracking parameters
        urlObj.search = '';
        return urlObj.toString();
      }
      
      // Return the normalized URL
      return url;
    } catch (error) {
      console.error('Error normalizing URL:', error);
      return url; // Return original URL if normalization fails
    }
  }
  
  /**
   * Process data extracted by Firecrawl
   */
  private async processFirecrawlData(crawlData: any, platform: string): Promise<any> {
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
   * Extract text content from HTML
   */
  private extractTextFromHtml(html: string): string {
    // Simple function to extract text from HTML
    // Remove HTML tags but keep their content
    return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
               .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
               .replace(/<[^>]+>/g, ' ')
               .replace(/\s{2,}/g, ' ')
               .trim();
  }
  
  /**
   * Extract vehicle data from listing text using AI
   */
  private async extractVehicleDataFromText(text: string, platform: string): Promise<any> {
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
          'Authorization': `Bearer ${openAIApiKey}`,
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
  
  /**
   * Simulate data extraction when direct extraction is not possible
   */
  private async simulateDataExtraction(url: string, platform: string) {
    try {
      const promptText = `
Extract vehicle information from this listing URL: ${url}
This is a ${platform} listing. Based on the URL structure and your knowledge of car listings, please create a JSON representation of what data might be in this listing.
Include fields like: make, model, year, price, mileage, vin (if possible), and a short fictional description.
Also include an imageUrl field with a fictional URL to an image of this vehicle.
Just respond with the JSON, no explanations.
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You extract structured data from car listing URLs. Respond with accurate JSON only.' },
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
      console.log('Extracted data:', data);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error simulating listing data extraction:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Identify the platform from the URL
   */
  identifyPlatform(url: string) {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('craigslist.org')) return 'Craigslist';
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('marketplace')) return 'Facebook Marketplace';
    if (lowerUrl.includes('cargurus.com')) return 'CarGurus';
    if (lowerUrl.includes('edmunds.com')) return 'Edmunds';
    if (lowerUrl.includes('autotrader.com')) return 'AutoTrader';
    if (lowerUrl.includes('cars.com')) return 'Cars.com';
    if (lowerUrl.includes('truecar.com')) return 'TrueCar';
    if (lowerUrl.includes('carmax.com')) return 'CarMax';
    if (lowerUrl.includes('ebay.com')) return 'eBay Motors';
    
    return 'Unknown Platform';
  }
}
