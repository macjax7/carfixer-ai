
/**
 * Utility for extracting images from HTML content
 */
export class ImageExtractorUtil {
  /**
   * Attempt to extract the main vehicle image URL from HTML content
   */
  static extractMainImageUrl(htmlContent: string): string | null {
    try {
      // Common patterns for vehicle listing images
      const imgPatterns = [
        /<meta\s+property="og:image"\s+content="([^"]+)"/i,
        /<meta\s+content="([^"]+)"\s+property="og:image"/i,
        /<img[^>]+class="[^"]*(?:main-image|primary-image|hero-image|gallery-image|carousel-image)[^"]*"[^>]+src="([^"]+)"/i,
        /<img[^>]+id="[^"]*(?:main-image|primary-image|hero|main-photo)[^"]*"[^>]+src="([^"]+)"/i,
        /<img[^>]+src="([^"]+(?:jpg|jpeg|png|webp))"[^>]+(?:alt="[^"]*(?:vehicle|car|truck|auto)[^"]*"|class="[^"]*(?:vehicle|car|truck|auto)[^"]*")/i,
        // Facebook Marketplace specific patterns
        /<div[^>]+class="[^"]*(?:x1rg5ohu|x1n2onr6)[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i,
        // Craigslist specific patterns
        /<div[^>]+id="thumbs"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"/i
      ];
      
      for (const pattern of imgPatterns) {
        const match = htmlContent.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      // Fallback: try to find any reasonably sized image
      const imgTagRegex = /<img[^>]+src="([^"]+(?:jpg|jpeg|png|webp))"[^>]+(?:width=["'](\d+)["']|height=["'](\d+)["'])/gi;
      let match;
      const imgCandidates = [];
      
      while ((match = imgTagRegex.exec(htmlContent)) !== null) {
        const width = match[2] ? parseInt(match[2], 10) : 0;
        const height = match[3] ? parseInt(match[3], 10) : 0;
        
        // Only consider reasonably sized images
        if (width > 300 || height > 300) {
          imgCandidates.push({
            url: match[1],
            size: width * height
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
