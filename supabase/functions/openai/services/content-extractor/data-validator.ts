
import { VehicleData } from "./types.ts";

/**
 * Utility for validating and normalizing extracted vehicle data
 */
export class DataValidatorUtil {
  /**
   * Validate extracted data and normalize values
   */
  static validateExtractedData(data: VehicleData): VehicleData {
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
    
    return data;
  }
}
