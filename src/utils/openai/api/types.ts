
/**
 * Common interface for vehicle data returned from any API
 */
export interface VehicleData {
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  vin?: string;
  trim?: string;
  fuelType?: string;
  transmission?: string;
  bodyStyle?: string;
  exteriorColor?: string;
  interiorColor?: string;
  engine?: string;
  driveTrain?: string;
  features?: string[];
  description?: string;
  imageUrl?: string;
  sellerType?: string;
  sellerName?: string;
  sellerLocation?: string;
  source?: string;
  sourceUrl?: string;
  unreliableExtraction?: boolean;
  extractionPartial?: boolean;
  [key: string]: any;
}

/**
 * Result from an API extraction attempt
 */
export interface ApiExtractionResult {
  success: boolean;
  extractionFailed?: boolean;
  error?: string;
  data: VehicleData;
}

/**
 * Interface for all vehicle listing API adapters
 */
export interface VehicleApiAdapter {
  canHandle(url: string): boolean;
  extractVehicleData(url: string): Promise<ApiExtractionResult>;
  getName(): string;
}
