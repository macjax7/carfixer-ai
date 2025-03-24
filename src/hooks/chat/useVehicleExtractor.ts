import { Vehicle } from '@/types/vehicle';

interface VehicleInfo {
  year: string;
  make: string;
  model: string;
}

export const useVehicleExtractor = () => {
  // Extract vehicle information from a message
  const extractVehicleInfo = (message: string, defaultVehicle: Vehicle | null = null): VehicleInfo | null => {
    // If we already have a selected vehicle, use it as default
    if (defaultVehicle) {
      return {
        year: defaultVehicle.year.toString(), // Convert number to string
        make: defaultVehicle.make,
        model: defaultVehicle.model
      };
    }
    
    // Try to extract vehicle info from the message
    const yearPattern = /\b(19|20)\d{2}\b/;
    const yearMatch = message.match(yearPattern);
    
    // Common car makes for pattern matching
    const carMakes = [
      'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'hyundai', 'kia', 
      'subaru', 'bmw', 'mercedes', 'audi', 'lexus', 'acura', 'mazda', 'volkswagen', 
      'vw', 'jeep', 'ram', 'dodge', 'chrysler', 'buick', 'cadillac', 'gmc', 'infiniti'
    ];
    
    // Create regex pattern for makes
    const makePattern = new RegExp(`\\b(${carMakes.join('|')})\\b`, 'i');
    const makeMatch = message.match(makePattern);
    
    // If we found both year and make, try to extract model
    if (yearMatch && makeMatch) {
      const year = yearMatch[0];
      const make = makeMatch[0].toLowerCase();
      
      // Attempt to extract model - this is a simplified approach
      // Would need more sophisticated NLP for production use
      let modelMatch = null;
      
      // Common models by make
      const commonModels: Record<string, string[]> = {
        'toyota': ['camry', 'corolla', 'rav4', 'tacoma', 'tundra', 'highlander'],
        'honda': ['civic', 'accord', 'cr-v', 'pilot', 'odyssey'],
        'ford': ['f-150', 'mustang', 'escape', 'explorer', 'focus'],
        'chevrolet': ['silverado', 'equinox', 'malibu', 'tahoe'],
        'chevy': ['silverado', 'equinox', 'malibu', 'tahoe'],
        'nissan': ['altima', 'sentra', 'rogue', 'pathfinder'],
        'infiniti': ['g35', 'g37', 'q50', 'qx60', 'qx80', 'fx35']
        // Add more as needed
      };
      
      if (commonModels[make]) {
        for (const model of commonModels[make]) {
          if (message.toLowerCase().includes(model)) {
            modelMatch = model;
            break;
          }
        }
      }
      
      return {
        year,
        make: make.charAt(0).toUpperCase() + make.slice(1), // Capitalize make
        model: modelMatch || 'Unknown'
      };
    }
    
    // Return null if we couldn't extract vehicle info
    return null;
  };

  return {
    extractVehicleInfo
  };
};
