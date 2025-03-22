
/**
 * Utility for extracting image URLs from HTML
 */
export class ImageExtractorUtil {
  /**
   * Extract image URL from HTML content with improved detection
   */
  static extractImageUrl(html: string): string | null {
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
}
