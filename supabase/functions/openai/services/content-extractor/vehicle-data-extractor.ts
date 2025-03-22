
import { VehicleData, ExtractionOptions } from "./types.ts";
import { TextExtractorUtil } from "./text-extractor.ts";
import { ImageExtractorUtil } from "./image-extractor.ts";
import { DataValidatorUtil } from "./data-validator.ts";
import { OpenAIService } from "./openai-service.ts";
import { PlatformHandler } from "./platform-handler.ts";
import { PromptBuilder } from "./prompt-builder.ts";
import { ResponseParser } from "./response-parser.ts";

/**
 * Service for extracting vehicle data from web content
 */
export class VehicleDataExtractorService {
  private openAIService: OpenAIService;
  private platformHandler: PlatformHandler;
  private promptBuilder: PromptBuilder;
  private responseParser: ResponseParser;
  
  constructor(openAIApiKey: string) {
    this.openAIService = new OpenAIService(openAIApiKey);
    this.platformHandler = new PlatformHandler();
    this.promptBuilder = new PromptBuilder();
    this.responseParser = new ResponseParser();
  }
  
  /**
   * Extract structured vehicle data from listing text using AI with platform-specific enhancements
   */
  async extractVehicleDataFromText(text: string, platform: string, htmlContent?: string): Promise<VehicleData> {
    try {
      // Try to extract image URL from HTML if available
      let imageUrl = null;
      if (htmlContent) {
        imageUrl = ImageExtractorUtil.extractImageUrl(htmlContent);
        if (imageUrl) {
          console.log('Extracted image URL from HTML:', imageUrl);
        } else {
          console.log('No image URL found in HTML content');
        }
      }

      // Create a platform-specific prompt hint
      const platformHint = this.platformHandler.getPlatformHint(platform);
      
      // Enhance content with platform-specific handling
      const enhancedContent = this.platformHandler.enhanceContentForPlatform(text, platform, htmlContent);
      
      // Build the prompt for OpenAI
      const promptText = this.promptBuilder.buildVehicleDataPrompt(enhancedContent, platformHint);
      
      // Call OpenAI to extract the data
      const textContent = await this.openAIService.extractStructuredData(promptText);
      
      // Parse the response into structured data
      let data = this.responseParser.parseOpenAIResponse(textContent);
      
      // Add the image URL if we found one and it's not already in the data
      if (imageUrl && !data.imageUrl) {
        data.imageUrl = imageUrl;
        console.log('Added image URL to vehicle data');
      }
      
      // Validate extracted data
      const validatedData = DataValidatorUtil.validateExtractedData(data);
      
      console.log('Extracted vehicle data:', validatedData);
      
      return validatedData;
    } catch (error) {
      console.error('Error extracting vehicle data from text:', error);
      throw error;
    }
  }
  
  /**
   * Process data extracted by Firecrawl
   */
  async processFirecrawlData(crawlData: any, platform: string): Promise<VehicleData> {
    try {
      console.log('Processing Firecrawl data for', platform);
      
      // Extract texts from the page content
      const pageText = crawlData?.pages?.[0]?.content?.markdown || '';
      const pageHtml = crawlData?.pages?.[0]?.content?.html || '';
      
      console.log('Extracted text length:', pageText.length);
      console.log('Extracted HTML length:', pageHtml.length);
      
      let contentToProcess = pageText;
      
      // If markdown is too short or empty, try to extract text from HTML
      if (pageText.length < 300 && pageHtml) {
        console.log('Markdown content too short, extracting from HTML');
        const textFromHtml = TextExtractorUtil.extractTextFromHtml(pageHtml);
        console.log('Extracted text from HTML length:', textFromHtml.length);
        
        if (textFromHtml.length > pageText.length) {
          console.log('Using text extracted from HTML instead');
          contentToProcess = textFromHtml;
        }
      }
      
      // Process the content to extract vehicle data
      return await this.extractVehicleDataFromText(
        contentToProcess, 
        platform,
        pageHtml // Pass HTML for image extraction
      );
    } catch (error) {
      console.error('Error processing Firecrawl data:', error);
      throw new Error('Unable to process the crawled webpage data');
    }
  }
}
