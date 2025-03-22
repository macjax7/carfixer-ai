
/**
 * Types for content extraction
 */

export interface VehicleData {
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  vin?: string;
  description?: string;
  imageUrl?: string;
  [key: string]: any;
}

export interface ExtractionOptions {
  platform: string;
  htmlContent?: string;
}
