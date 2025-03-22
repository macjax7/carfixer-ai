
import { VehicleDataExtractorService } from "./vehicle-data-extractor.ts";
import { TextExtractorUtil } from "./text-extractor.ts";
import { ImageExtractorUtil } from "./image-extractor.ts";
import { DataValidatorUtil } from "./data-validator.ts";
import { VehicleData } from "./types.ts";

/**
 * Service for extracting and processing content from web pages
 */
export class ContentExtractorService {
  private openAIApiKey: string;
  private vehicleDataExtractor: VehicleDataExtractorService;
  
  constructor(openAIApiKey: string) {
    this.openAIApiKey = openAIApiKey;
    this.vehicleDataExtractor = new VehicleDataExtractorService(openAIApiKey);
  }
  
  /**
   * Extract text content from HTML with enhanced vehicle listing focus
   */
  extractTextFromHtml(html: string): string {
    return TextExtractorUtil.extractTextFromHtml(html);
  }
  
  /**
   * Extract image URL from HTML content with improved detection
   */
  extractImageUrl(html: string): string | null {
    return ImageExtractorUtil.extractImageUrl(html);
  }
  
  /**
   * Extract structured vehicle data from listing text using AI with platform-specific enhancements
   */
  async extractVehicleDataFromText(text: string, platform: string, htmlContent?: string): Promise<VehicleData> {
    return this.vehicleDataExtractor.extractVehicleDataFromText(text, platform, htmlContent);
  }
  
  /**
   * Process data extracted by Firecrawl
   */
  async processFirecrawlData(crawlData: any, platform: string): Promise<VehicleData> {
    return this.vehicleDataExtractor.processFirecrawlData(crawlData, platform);
  }
}
