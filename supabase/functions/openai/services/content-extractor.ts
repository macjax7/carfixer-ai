/**
 * Service for extracting and processing content from web pages
 */
export class ContentExtractorService {
  private openAIApiKey: string;
  
  constructor(openAIApiKey: string) {
    this.openAIApiKey = openAIApiKey;
  }
  
  /**
   * Extract text content from HTML
   */
  extractTextFromHtml(html: string): string {
    try {
      // First remove styles, scripts and other non-content elements
      let cleanedHtml = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
      
      // Keep specific vehicle-related sections if possible
      const vehicleSections = [
        'vehicle-details', 'listing-details', 'vehicle-info',
        'vdp-content', 'vdp-details', 'vehicle-description',
        'listing-overview', 'vehicle-overview'
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
        .replace(/\s{2,}/g, ' ')   // Replace multiple spaces with a single space
        .trim();                   // Trim leading/trailing whitespace
    } catch (error) {
      console.error('Error extracting text from HTML:', error);
      // Fallback to basic extraction if the enhanced method fails
      return html.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim();
    }
  }
  
  /**
   * Extract image URL from HTML content
   */
  extractImageUrl(html: string): string | null {
    try {
      // Common patterns for vehicle listing images
      const imgPatterns = [
        // Meta OG image (common for social sharing)
        /<meta\s+property="og:image"\s+content="([^"]+)"/i,
        
        // Main image classes
        /<img[^>]+class="[^"]*(?:main-image|primary-image|hero-image|gallery-image|carousel-image)[^"]*"[^>]+src="([^"]+)"/i,
        
        // Main image IDs
        /<img[^>]+id="[^"]*(?:main-image|primary-image|hero|main-photo)[^"]*"[^>]+src="([^"]+)"/i,
        
        // Vehicle-related alt text
        /<img[^>]+src="([^"]+(?:jpg|jpeg|png|webp))"[^>]+alt="[^"]*(?:vehicle|car|truck|auto|listing)[^"]*"/i,
        
        // Image within a gallery or carousel
        /<div[^>]+class="[^"]*(?:gallery|carousel|image-viewer)[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
        
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
                               html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
            
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
   * Extract structured vehicle data from listing text using AI
   */
  async extractVehicleDataFromText(text: string, platform: string, htmlContent?: string): Promise<any> {
    try {
      // Try to extract image URL from HTML if available
      let imageUrl = null;
      if (htmlContent) {
        imageUrl = this.extractImageUrl(htmlContent);
        if (imageUrl) {
          console.log('Extracted image URL from HTML:', imageUrl);
        }
      }

      // Prepare a focused prompt for the AI to extract vehicle details
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
- imageUrl (string, optional): URL to main image if found in the data

Focus on accuracy. For the price and mileage, return only the numeric value without currency symbols or commas.
Return ONLY the JSON with these fields, nothing else. If a field is not found in the text, omit it from the JSON.
`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You extract structured vehicle listing data from text. Respond with valid JSON only.' },
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
      } catch (e) {
        console.error('Error parsing OpenAI response as JSON:', e);
        // Try to extract JSON from the response if it's not pure JSON
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not extract JSON from OpenAI response');
        }
      }
      
      // Add the image URL if we found one
      if (imageUrl && !data.imageUrl) {
        data.imageUrl = imageUrl;
      }
      
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
