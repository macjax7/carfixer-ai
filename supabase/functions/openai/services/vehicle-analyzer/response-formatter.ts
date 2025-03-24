
/**
 * Formatter for vehicle analysis responses
 */
export class ResponseFormatter {
  /**
   * Generate analysis that clearly indicates an error occurred
   */
  generateErrorAnalysis(vehicleData: any, error: any): any {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      reliability: `Unable to provide reliability analysis due to data extraction issues: ${errorMessage}. Please verify the vehicle details manually or try a different listing.`,
      
      marketValue: `Market value analysis is unavailable due to data extraction issues: ${errorMessage}. To get an accurate market value assessment, please provide more specific vehicle details.`,
      
      maintenanceNeeds: `Maintenance needs analysis is unavailable due to data extraction issues: ${errorMessage}. For maintenance information, please provide the vehicle's make, model, year, and mileage.`,
      
      redFlags: `Red flags analysis is unavailable due to data extraction issues: ${errorMessage}. Please verify that the listing URL is valid and accessible.`,
      
      recommendation: `I cannot provide a recommendation due to data extraction issues: ${errorMessage}. Please try again with a different listing URL or provide the vehicle details manually.`,
      
      error: true,
      errorDetails: errorMessage
    };
  }
  
  /**
   * Get content that clearly indicates limitations due to missing data
   */
  getLimitationsContentForField(field: string, vehicleData: any): string {
    const vehicleDesc = this.getVehicleDescription(vehicleData);
    
    switch (field) {
      case 'reliability':
        return `Limited reliability analysis for ${vehicleDesc}: Not enough specific data was provided to give a detailed reliability assessment. For an accurate reliability analysis, I would need the exact make, model, and year of the vehicle.`;
      
      case 'marketValue':
        return `Limited market value analysis for ${vehicleDesc}: ${!vehicleData.price ? 'No price information was provided. ' : ''}${!vehicleData.mileage ? 'No mileage information was provided. ' : ''}Without complete pricing and vehicle condition details, I cannot accurately assess the market value. Please provide more specific information for a proper market analysis.`;
      
      case 'maintenanceNeeds':
        return `Limited maintenance needs analysis for ${vehicleDesc}: ${!vehicleData.mileage ? 'No mileage information was provided. ' : ''}Without specific details about the vehicle's history and current condition, I can only provide general maintenance recommendations. Please provide more information for specific maintenance guidance.`;
      
      case 'redFlags':
        return `Limited red flags analysis for ${vehicleDesc}: Without complete listing details, I cannot identify specific concerns. Generally, you should be cautious about listings with limited information, no photos, vague descriptions, or pricing that seems too good to be true. Always inspect the vehicle in person and consider a professional inspection.`;
      
      case 'recommendation':
        return `Cannot provide a recommendation for ${vehicleDesc}: There is insufficient information to make a responsible recommendation about this vehicle. I recommend gathering more specific details about this vehicle, including a vehicle history report, service records, and a professional inspection before making a purchase decision.`;
      
      default:
        return `Limited analysis available: Insufficient data was provided to analyze this aspect of the vehicle listing.`;
    }
  }
  
  /**
   * Get a descriptive string for the vehicle
   */
  getVehicleDescription(vehicleData: any): string {
    let desc = '';
    
    if (vehicleData.year) desc += `${vehicleData.year} `;
    if (vehicleData.make) desc += `${vehicleData.make} `;
    if (vehicleData.model) desc += `${vehicleData.model}`;
    
    if (desc.trim()) {
      return desc.trim();
    }
    
    if (vehicleData.vin) {
      return `vehicle with VIN ${vehicleData.vin}`;
    }
    
    return 'the vehicle in this listing';
  }
}
