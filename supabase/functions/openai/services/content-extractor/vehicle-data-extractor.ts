
import { VehicleData, ExtractionOptions } from "./types.ts";
import { TextExtractorUtil } from "./text-extractor.ts";
import { ImageExtractorUtil } from "./image-extractor.ts";
import { DataValidatorUtil } from "./data-validator.ts";

/**
 * Service for extracting vehicle data from web content
 */
export class VehicleDataExtractorService {
  private openAIApiKey: string;
  
  constructor(openAIApiKey: string) {
    this.openAIApiKey = openAIApiKey;
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
      let platformHint = '';
      switch (platform.toLowerCase()) {
        case 'facebook marketplace':
          platformHint = 'Focus on extracting details from Facebook Marketplace format which typically shows price prominently, followed by location and posting date. Vehicle details are usually in a structured format below the images.';
          break;
        case 'craigslist':
          platformHint = 'Focus on the posting body and attribute groups which contain key vehicle details in Craigslist listings. VIN is often in the description or attributes section.';
          break;
        case 'cargurus':
          platformHint = 'CarGurus listings typically show structured information including price history and dealer reputation. Look for key specifications in the vehicle details section.';
          break;
        case 'autotrader':
          platformHint = 'AutoTrader provides structured vehicle information including price, mileage, and features. Details are typically well-organized in sections.';
          break;
        default:
          platformHint = 'Look for structured data patterns including price (often with $ symbol), mileage (often followed by "miles"), year/make/model (typically grouped together), and VIN (17-character alphanumeric code).';
      }

      // Prepare a focused prompt for the AI to extract vehicle details
      const promptText = `
Extract vehicle information from this ${platform} listing:

${text.slice(0, 8000)}  # Limit text to avoid exceeding token limits

${platformHint}

Extract and format as JSON with these fields:
- make (string): Car manufacturer (e.g., Ford, Toyota, Honda)
- model (string): Car model (e.g., F-150, Camry, Civic)
- year (number): Production year (e.g., 2018)
- price (number): Asking price in USD without currency symbols or commas
- mileage (number): Mileage in miles without commas
- vin (string, optional): Vehicle Identification Number if available (17-character alphanumeric code)
- description (string): Seller's description, trimmed if needed
- imageUrl (string, optional): URL to main image if found in the data

Focus on accuracy. For the price and mileage, return only the numeric value without currency symbols or commas.
Return ONLY the JSON with these fields, nothing else. If a field is not found in the text, omit it from the JSON.
`;

      console.log('Sending vehicle data extraction prompt to OpenAI');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You extract structured vehicle listing data from text. Respond with valid JSON only. Be precise and extract exactly what is in the text without making up information. If information is not clearly present, do not include that field in the JSON.' },
            { role: 'user', content: promptText }
          ],
          temperature: 0.1, // Lower temperature for more consistent results
          response_format: { type: "json_object" } // Request JSON format explicitly
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API error:', errorData);
        throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      const textContent = result.choices[0].message.content;
      
      // Parse the JSON response
      let data: VehicleData;
      try {
        data = JSON.parse(textContent);
        console.log('Successfully parsed vehicle data from OpenAI response');
      } catch (e) {
        console.error('Error parsing OpenAI response as JSON:', e);
        // Try to extract JSON from the response if it's not pure JSON
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
          console.log('Extracted JSON from partial response');
        } else {
          throw new Error('Could not extract JSON from OpenAI response');
        }
      }
      
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
      
      // For Facebook Marketplace, we need special handling because of their dynamic content
      if (platform.toLowerCase().includes('facebook')) {
        console.log('Using special handling for Facebook Marketplace content');
        // Try to find Facebook-specific patterns in the HTML
        const fbPriceMatch = pageHtml.match(/<span[^>]*>\$([0-9,.]+)<\/span>/);
        const fbTitleMatch = pageHtml.match(/<span[^>]*>([^<]*(?:20\d{2}|19\d{2})[^<]*)<\/span>/);
        
        if (fbPriceMatch || fbTitleMatch) {
          console.log('Found Facebook-specific patterns in HTML');
          // Enhance the content with the extracted patterns
          let fbExtractedContent = '';
          
          if (fbTitleMatch && fbTitleMatch[1]) {
            fbExtractedContent += `Title: ${fbTitleMatch[1]}\n`;
          }
          
          if (fbPriceMatch && fbPriceMatch[1]) {
            fbExtractedContent += `Price: $${fbPriceMatch[1]}\n`;
          }
          
          // Prepend this to the content for better extraction
          contentToProcess = fbExtractedContent + '\n' + contentToProcess;
        }
      }
      
      // Process the content to extract vehicle data
      const vehicleData = await this.extractVehicleDataFromText(
        contentToProcess, 
        platform,
        pageHtml // Pass HTML for image extraction
      );
      
      return vehicleData;
    } catch (error) {
      console.error('Error processing Firecrawl data:', error);
      throw new Error('Unable to process the crawled webpage data');
    }
  }
}
