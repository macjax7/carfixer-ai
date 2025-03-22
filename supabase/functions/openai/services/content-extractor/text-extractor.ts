/**
 * Utility for extracting text content from HTML
 */
export class TextExtractorUtil {
  /**
   * Extract text content from HTML with enhanced vehicle listing focus
   */
  static extractTextFromHtml(html: string): string {
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
}
