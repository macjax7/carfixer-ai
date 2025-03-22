
import { FirecrawlService } from './firecrawl.ts';
import { PlatformDetectorService } from './platform-detector.ts';
import { UrlNormalizerService } from './url-normalizer.ts';
import { ContentExtractorService } from './content-extractor.ts';
import { DataSimulatorService } from './data-simulator.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

/**
 * Service for extracting data from vehicle listings
 */
export class ListingExtractorService {
  private firecrawlService: FirecrawlService | null = null;
  private platformDetector: PlatformDetectorService;
  private urlNormalizer: UrlNormalizerService;
  private contentExtractor: ContentExtractorService;
  private dataSimulator: DataSimulatorService;
  
  constructor() {
    // Initialize services
    this.platformDetector = new PlatformDetectorService();
    this.urlNormalizer = new UrlNormalizerService();
    
    if (!openAIApiKey) {
      console.warn('OPENAI_API_KEY not found in environment variables. AI features will not work correctly.');
    }
    
    this.contentExtractor = new ContentExtractorService(openAIApiKey || '');
    this.dataSimulator = new DataSimulatorService(openAIApiKey || '');
    
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
      const platform = this.platformDetector.identifyPlatform(url);
      console.log('Identified platform:', platform);
      
      // Normalize the URL (handle shortened URLs, etc.)
      const normalizedUrl = await this.urlNormalizer.normalizeUrl(url);
      console.log('Normalized URL:', normalizedUrl);
      
      if (this.firecrawlService) {
        try {
          // Use Firecrawl service to extract data from the webpage if available
          console.log('Attempting to extract listing data with Firecrawl');
          const crawlResult = await this.firecrawlService.crawlUrl(normalizedUrl);
          
          if (crawlResult.success) {
            console.log('Successfully extracted data with Firecrawl');
            
            // Process the crawled data to extract vehicle information
            const vehicleData = await this.contentExtractor.processFirecrawlData(crawlResult.data, platform);
            
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
      return this.dataSimulator.simulateDataExtraction(normalizedUrl, platform);
    } catch (error) {
      console.error('Error extracting listing data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in listing extraction'
      };
    }
  }
}
