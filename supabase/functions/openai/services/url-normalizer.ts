
/**
 * Service for normalizing and resolving URLs
 */
export class UrlNormalizerService {
  /**
   * Normalize URL to handle shortened URLs, tracking parameters, etc.
   */
  async normalizeUrl(url: string): Promise<string> {
    try {
      // Remove tracking parameters and fragments
      const urlObj = new URL(url);
      
      // Handle common URL shorteners (t.co, bit.ly, etc.)
      if (urlObj.hostname.includes('bit.ly') || 
          urlObj.hostname.includes('tinyurl.com') || 
          urlObj.hostname.includes('t.co') ||
          urlObj.hostname.includes('goo.gl')) {
        try {
          // Attempt to resolve shortened URL
          console.log('Attempting to resolve shortened URL:', url);
          const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
          if (response.url && response.url !== url) {
            console.log('Resolved shortened URL to:', response.url);
            return this.normalizeUrl(response.url); // Recursively normalize the resolved URL
          }
        } catch (error) {
          console.error('Error resolving shortened URL:', error);
          // Continue with original URL if resolution fails
        }
      }
      
      // Clean up Facebook URLs
      if (urlObj.hostname.includes('facebook.com')) {
        // Remove tracking parameters
        urlObj.search = '';
        return urlObj.toString();
      }
      
      // Return the normalized URL
      return url;
    } catch (error) {
      console.error('Error normalizing URL:', error);
      return url; // Return original URL if normalization fails
    }
  }
}
