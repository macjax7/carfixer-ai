/**
 * Service for extracting and processing content from web pages
 */
export class ContentExtractorService {
  private openAIApiKey: string;
  
  constructor(openAIApiKey: string) {
    this.openAIApiKey = openAIApiKey;
  }
  
  /**
   * Extract text content from HTML with enhanced vehicle listing focus
   */
  extractTextFromHtml(html: string): string {
    try {
      // First remove styles, scripts and other non-content elements
      let cleanedHtml = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
      
      // Keep specific vehicle-related sections if possible
      const vehicleSections = [
        // General vehicle section identifiers
        'vehicle-details', 'listing-details', 'vehicle-info',
        'vdp-content', 'vdp-details', 'vehicle-description',
        'listing-overview', 'vehicle-overview',
        
        // Platform-specific sections
        // Facebook Marketplace
        'marketplace_pdp_container', 'x1qjc9v5', 'x9f619',
        
        // Craigslist
        'postingbody', 'attrgroup', 'mapAndAttrs',
        
        // CarGurus
        'cg-listing-key-details', 'cg-listing-attributes', 'cg-listing-description',
        
        // AutoTrader
        'first-price', 'about-section', 'vehicle-info'
      ];
      
      let vehicleContent = '';
      
      // Try to extract specific vehicle content sections first
      for (const section of vehicleSections) {
        const sectionRegex = new RegExp(`<[^>]+(?:id|class)=["']([^"']*${section}[^"']*)["'][^>]*>([\\s\\S]*?)<\/[^>]+>`, 'i');
        const match = cleanedHtml.match(sectionRegex);
        
        if (match && match[2]) {
          vehicleContent += match[2] + ' ';
        }
      }
      
      // If we found vehicle-specific content, use that, otherwise use the full page
      const textToProcess = vehicleContent.length > 300 ? vehicleContent : cleanedHtml;
      
      // Now remove all HTML tags but keep their content, and clean up whitespace
      return textToProcess
        .replace(/<[^>]+>/g, ' ')  // Replace tags with spaces
        .replace(/&nbsp;/g, ' ')   // Replace &nbsp; with spaces
        .replace(/&amp;/g, '&')    // Replace &amp; with &
        .replace(/&quot;/g, '"')   // Replace &quot; with "
        .replace(/&lt;/g, '<')     // Replace &lt; with <
        .replace(/&gt;/g, '>')     // Replace &gt; with >
        .replace(/\s{2,}/g, ' ')   // Replace multiple spaces with a single space
        .trim();                   // Trim leading/trailing whitespace
    } catch (error) {
      console.error('Error extracting text from HTML:', error);
      // Fallback to basic extraction if the enhanced method fails
      return html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
    }
  }
  
  /**
   * Extract image URL from HTML content with improved detection
   */
  extractImageUrl(html: string): string | null {
    try {
      // Common patterns for vehicle listing images
      const imgPatterns = [
        // Meta OG image (common for social sharing)
        /<meta\s+property="og:image"\s+content="([^"]+)"/i,
        /<meta\s+content="([^"]+)"\s+property="og:image"/i,
        
        // Main image classes
        /<img[^>]+class="[^"]*(?:main-image|primary-image|hero-image|gallery-image|carousel-image)[^"]*"[^>]+src="([^"]+)"/i,
        
        // Main image IDs
        /<img[^>]+id="[^"]*(?:main-image|primary-image|hero|main-photo)[^"]*"[^>]+src="([^"]+)"/i,
        
        // Vehicle-related alt text
        /<img[^>]+src="([^"]+(?:jpg|jpeg|png|webp))"[^>]+alt="[^"]*(?:vehicle|car|truck|auto|listing)[^"]*"/i,
        
        // Facebook Marketplace specific patterns
        /<div[^>]+class="[^"]*(?:x1rg5ohu|x1n2onr6)[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
        
        // Craigslist specific patterns
        /<div[^>]+id="thumbs"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/i,
        
        // Image within a gallery or carousel
        /<div[^>]+class="[^"]*(?:gallery|carousel|image-viewer|slider)[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
        
        // Any reasonably large image
        /<img[^>]+src="([^"]+(?:jpg|jpeg|png|webp))"[^>]+(?:width=["'](\d+)["']|height=["'](\d+)["'])/i
      ];
      
      for (const pattern of imgPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          // Check if it's a relative URL and make it absolute
          if (match[1].startsWith('/')) {
            // Try to extract domain from HTML
            const domainMatch = html.match(/<meta[^>]+(?:property="og:url"|name="twitter:domain")[^>]+content="([^"]+)"/i) || 
                               html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i) ||
                               html.match(/<base[^>]+href="([^"]+)"/i);
            
            if (domainMatch && domainMatch[1]) {
              try {
                const baseUrl = new URL(domainMatch[1]);
                return `${baseUrl.origin}${match[1]}`;
              } catch (e) {
                // If URL parsing fails, return the relative URL
                return match[1];
              }
            }
          }
          
          // Return the absolute URL
          return match[1];
        }
      }
      
      // Fallback: try to find any reasonably sized image
      const imgTagRegex = /<img[^>]+src="([^"]+(?:jpg|jpeg|png|webp))"[^>]+(?:width=["'](\d+)["']|height=["'](\d+)["'])/gi;
      let match;
      const imgCandidates = [];
      
      while ((match = imgTagRegex.exec(html)) !== null) {
        const width = match[2] ? parseInt(match[2], 10) : 0;
        const height = match[3] ? parseInt(match[3], 10) : 0;
        
        // Only consider reasonably sized images
        if (width > 300 || height > 300) {
          imgCandidates.push({
            url: match[1],
            size: width * height || 90000 // If no dimensions, assume medium size
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
  
  /**
   * Extract structured vehicle data from listing text using AI with platform-specific enhancements
   */
  async extractVehicleDataFromText(text: string, platform: string, htmlContent?: string): Promise<any> {
    try {
      // Try to extract image URL from HTML if available
      let imageUrl = null;
      if (htmlContent) {
        imageUrl = this.extractImageUrl(htmlContent);
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
      let data;
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
      this.validateExtractedData(data);
      
      console.log('Extracted vehicle data:', data);
      
      return data;
    } catch (error) {
      console.error('Error extracting vehicle data from text:', error);
      throw error;
    }
  }
  
  /**
   * Process data extracted by Firecrawl
   */
  async processFirecrawlData(crawlData: any, platform: string): Promise<any> {
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
        const textFromHtml = this.extractTextFromHtml(pageHtml);
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

  /**
   * Validate extracted data and normalize values
   */
  private validateExtractedData(data: any) {
    // Convert year to number if it's a string
    if (data.year && typeof data.year === 'string') {
      const yearNumber = parseInt(data.year.trim(), 10);
      if (!isNaN(yearNumber)) {
        data.year = yearNumber;
        console.log('Converted year from string to number:', data.year);
      }
    }
    
    // Convert price to number if it's a string
    if (data.price && typeof data.price === 'string') {
      // Remove currency symbols and commas
      const priceString = data.price.replace(/[$,]/g, '').trim();
      const priceNumber = parseFloat(priceString);
      if (!isNaN(priceNumber)) {
        data.price = priceNumber;
        console.log('Converted price from string to number:', data.price);
      }
    }
    
    // Convert mileage to number if it's a string
    if (data.mileage && typeof data.mileage === 'string') {
      // Remove "miles" and commas
      const mileageString = data.mileage.replace(/,|miles|mi/gi, '').trim();
      const mileageNumber = parseFloat(mileageString);
      if (!isNaN(mileageNumber)) {
        data.mileage = mileageNumber;
        console.log('Converted mileage from string to number:', data.mileage);
      }
    }
    
    // Trim description if it's too long
    if (data.description && typeof data.description === 'string' && data.description.length > 1000) {
      data.description = data.description.substring(0, 1000) + '...';
      console.log('Trimmed long description to 1000 characters');
    }
    
    // Validate VIN format if present
    if (data.vin && typeof data.vin === 'string') {
      // Typical VIN is 17 characters
      if (data.vin.length !== 17) {
        console.warn('VIN may be invalid - not 17 characters:', data.vin);
      }
      // Normalize VIN to uppercase
      data.vin = data.vin.toUpperCase();
    }
  }
}
