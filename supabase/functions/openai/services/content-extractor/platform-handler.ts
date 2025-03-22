
/**
 * Service for generating platform-specific prompts and handling platform-specific data extraction
 */
export class PlatformHandler {
  /**
   * Generate a platform-specific hint for the AI prompt
   */
  getPlatformHint(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'facebook marketplace':
        return 'Focus on extracting details from Facebook Marketplace format which typically shows price prominently, followed by location and posting date. Vehicle details are usually in a structured format below the images.';
      case 'craigslist':
        return 'Focus on the posting body and attribute groups which contain key vehicle details in Craigslist listings. VIN is often in the description or attributes section.';
      case 'cargurus':
        return 'CarGurus listings typically show structured information including price history and dealer reputation. Look for key specifications in the vehicle details section.';
      case 'autotrader':
        return 'AutoTrader provides structured vehicle information including price, mileage, and features. Details are typically well-organized in sections.';
      default:
        return 'Look for structured data patterns including price (often with $ symbol), mileage (often followed by "miles"), year/make/model (typically grouped together), and VIN (17-character alphanumeric code).';
    }
  }
  
  /**
   * Handle platform-specific content preprocessing
   */
  enhanceContentForPlatform(text: string, platform: string, htmlContent?: string): string {
    // For Facebook Marketplace, we need special handling because of their dynamic content
    if (platform.toLowerCase().includes('facebook') && htmlContent) {
      console.log('Using special handling for Facebook Marketplace content');
      // Try to find Facebook-specific patterns in the HTML
      const fbPriceMatch = htmlContent.match(/<span[^>]*>\$([0-9,.]+)<\/span>/);
      const fbTitleMatch = htmlContent.match(/<span[^>]*>([^<]*(?:20\d{2}|19\d{2})[^<]*)<\/span>/);
      
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
        return fbExtractedContent + '\n' + text;
      }
    }
    
    return text;
  }
}
