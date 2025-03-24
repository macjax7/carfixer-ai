
/**
 * Validator for vehicle data
 */
export class VehicleDataValidator {
  /**
   * Validate vehicle data for minimum required fields
   */
  validateVehicleData(vehicleData: any): string[] {
    const errors = [];
    
    // Check for minimum required fields
    if (!vehicleData.make) errors.push('Missing vehicle make');
    if (!vehicleData.model) errors.push('Missing vehicle model');
    if (!vehicleData.year) errors.push('Missing vehicle year');
    
    // Additional validation for data quality
    if (vehicleData.year && (isNaN(Number(vehicleData.year)) || Number(vehicleData.year) < 1900 || Number(vehicleData.year) > new Date().getFullYear() + 1)) {
      errors.push(`Invalid year: ${vehicleData.year}`);
    }
    
    if (vehicleData.price && (isNaN(Number(vehicleData.price)) || Number(vehicleData.price) <= 0)) {
      errors.push(`Invalid price: ${vehicleData.price}`);
    }
    
    if (vehicleData.mileage && (isNaN(Number(vehicleData.mileage)) || Number(vehicleData.mileage) < 0)) {
      errors.push(`Invalid mileage: ${vehicleData.mileage}`);
    }
    
    // VIN validation (basic length check)
    if (vehicleData.vin && (typeof vehicleData.vin !== 'string' || vehicleData.vin.length !== 17)) {
      errors.push(`Invalid VIN format: ${vehicleData.vin}`);
    }
    
    return errors;
  }
}
