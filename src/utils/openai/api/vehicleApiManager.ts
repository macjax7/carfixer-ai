
import { VehicleApiAdapter, ApiExtractionResult } from './types';
import { AutoTraderApi } from './platforms/autoTraderApi';
import { CarGurusApi } from './platforms/carGurusApi';
import { CarsComApi } from './platforms/carsComApi';
import { MarketCheckApi } from './platforms/marketCheckApi';

/**
 * Manager class for handling multiple vehicle API adapters
 */
export class VehicleApiManager {
  private adapters: VehicleApiAdapter[] = [];
  
  constructor() {
    // Register available API adapters
    this.registerAdapter(new AutoTraderApi());
    this.registerAdapter(new CarGurusApi());
    this.registerAdapter(new CarsComApi());
    this.registerAdapter(new MarketCheckApi());
  }
  
  /**
   * Register a new API adapter
   */
  public registerAdapter(adapter: VehicleApiAdapter): void {
    this.adapters.push(adapter);
  }
  
  /**
   * Extract vehicle data using the appropriate API adapter
   */
  public async extractVehicleData(url: string): Promise<ApiExtractionResult> {
    // Find the first adapter that can handle this URL
    for (const adapter of this.adapters) {
      if (adapter.canHandle(url)) {
        console.log(`Using ${adapter.getName()} adapter for URL: ${url}`);
        try {
          const result = await adapter.extractVehicleData(url);
          return result;
        } catch (error) {
          console.error(`Error with ${adapter.getName()} adapter:`, error);
        }
      }
    }
    
    // If no adapter can handle it or all failed
    console.log('No API adapter available for URL:', url);
    return {
      success: false,
      extractionFailed: true,
      error: 'No compatible API available for this vehicle listing site',
      data: {
        unreliableExtraction: true,
        sourceUrl: url
      }
    };
  }
}
