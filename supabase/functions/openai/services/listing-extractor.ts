
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
      
      // Normalize the URL (handle shortened URLs, inventory pages, etc.)
      try {
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
              
              // If extracted data is too sparse, treat as an extraction failure
              if (!vehicleData.make && !vehicleData.model && !vehicleData.year && !vehicleData.vin) {
                console.warn('Extraction yielded insufficient vehicle data, treating as failure');
                return {
                  success: false,
                  error: 'Insufficient vehicle data extracted',
                  data: {
                    unreliableExtraction: true,
                    url: normalizedUrl,
                    errorMessage: 'Could not extract sufficient vehicle information from the provided link. Please ensure you\'re sharing a direct link to a specific vehicle listing.'
                  }
                };
              }
              
              return {
                success: true,
                data: {
                  ...vehicleData,
                  url: normalizedUrl,
                  platform
                }
              };
            } else {
              console.warn('Firecrawl extraction failed:', crawlResult.error);
              return {
                success: false,
                error: crawlResult.error || 'Failed to extract data from vehicle listing URL',
                data: {
                  unreliableExtraction: true,
                  url: normalizedUrl,
                  platform,
                  errorMessage: 'Could not access vehicle listing information. The page might require login or is not publicly accessible.'
                }
              };
            }
          } catch (error) {
            console.error('Error with Firecrawl service:', error);
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error extracting vehicle data',
              data: {
                unreliableExtraction: true,
                url: normalizedUrl,
                errorMessage: 'Error extracting vehicle data from the listing. Please try a different link or enter the vehicle details manually.'
              }
            };
          }
        } else {
          console.log('Firecrawl service not available, returning error');
          return {
            success: false,
            error: 'Web scraping service not available',
            data: {
              unreliableExtraction: true,
              url: normalizedUrl,
              errorMessage: 'Vehicle listing extraction service is unavailable. Please try again later.'
            }
          };
        }
      } catch (urlError) {
        console.error('Error normalizing URL:', urlError);
        return {
          success: false,
          error: 'Invalid or unsupported URL format',
          data: {
            unreliableExtraction: true,
            url: url,
            errorMessage: 'The provided URL appears to be invalid or in an unsupported format. Please ensure you\'re sharing a direct link to a specific vehicle listing.'
          }
        };
      }
    } catch (error) {
      console.error('Error extracting listing data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in listing extraction',
        data: {
          unreliableExtraction: true,
          url: url,
          errorMessage: 'Error processing vehicle listing URL. Please try a different link.'
        }
      };
    }
  }
}
