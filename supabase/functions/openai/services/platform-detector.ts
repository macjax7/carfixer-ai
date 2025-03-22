
/**
 * Service for identifying platforms from URLs
 */
export class PlatformDetectorService {
  /**
   * Identify the platform from the URL
   */
  identifyPlatform(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('craigslist.org')) return 'Craigslist';
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com') || lowerUrl.includes('marketplace')) return 'Facebook Marketplace';
    if (lowerUrl.includes('cargurus.com')) return 'CarGurus';
    if (lowerUrl.includes('edmunds.com')) return 'Edmunds';
    if (lowerUrl.includes('autotrader.com')) return 'AutoTrader';
    if (lowerUrl.includes('cars.com')) return 'Cars.com';
    if (lowerUrl.includes('truecar.com')) return 'TrueCar';
    if (lowerUrl.includes('carmax.com')) return 'CarMax';
    if (lowerUrl.includes('ebay.com')) return 'eBay Motors';
    
    return 'Unknown Platform';
  }
}
