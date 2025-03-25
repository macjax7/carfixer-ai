
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
    
    // Common car makes for pattern matching - expanded list
    const carMakes = [
      'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'hyundai', 'kia', 
      'subaru', 'bmw', 'mercedes', 'mercedes-benz', 'benz', 'audi', 'lexus', 'acura', 'mazda', 'volkswagen', 
      'vw', 'jeep', 'ram', 'dodge', 'chrysler', 'buick', 'cadillac', 'gmc', 'infiniti',
      'land rover', 'range rover', 'jaguar', 'volvo', 'porsche', 'mini', 'tesla', 'fiat',
      'alfa romeo', 'maserati', 'ferrari', 'lamborghini', 'bentley', 'rolls-royce',
      'aston martin', 'lotus', 'genesis', 'lincoln', 'mitsubishi', 'suzuki', 'scion'
    ];
    
    // Create regex pattern for makes
    const makePattern = new RegExp(`\\b(${carMakes.join('|')})\\b`, 'i');
    const makeMatch = message.match(makePattern);
    
    // If we found both year and make, try to extract model
    if (yearMatch && makeMatch) {
      const year = yearMatch[0];
      let make = makeMatch[0].toLowerCase();
      
      // Normalize make names
      if (make === 'chevy') make = 'chevrolet';
      if (make === 'benz' || make === 'mercedes') make = 'mercedes-benz';
      if (make === 'vw') make = 'volkswagen';
      
      // Extract model - more sophisticated approach
      // Get everything after the make until the end of the sentence or next punctuation
      const text = message.toLowerCase();
      const makeIndex = text.indexOf(make);
      if (makeIndex >= 0) {
        // Look for model after the make
        const afterMakeText = text.substring(makeIndex + make.length).trim();
        
        // Extract first word or words until punctuation or end
        let modelMatch = '';
        const maxWords = 3; // Extract up to 3 words for model
        const words = afterMakeText.split(/\s+/);
        
        // Skip initial words like "is", "a", "the", etc.
        let startIndex = 0;
        const skipWords = ['is', 'a', 'the', 'my', 'an', 'this', 'that', 'our', 'their'];
        while (startIndex < words.length && skipWords.includes(words[startIndex])) {
          startIndex++;
        }
        
        // Take up to maxWords for the model
        for (let i = startIndex; i < startIndex + maxWords && i < words.length; i++) {
          const word = words[i];
          // Stop at punctuation or connecting words
          if (/[,.!?]/.test(word) || ['and', 'but', 'or', 'with', 'has', 'had'].includes(word)) {
            break;
          }
          modelMatch += (modelMatch ? ' ' : '') + word;
        }
        
        // Check for common model patterns like "e350", "f-150", etc.
        if (!modelMatch) {
          const modelPatterns = [
            /\b[a-z]\d{2,3}\b/i,             // e.g., e350, m3
            /\b[a-z]-\d{2,3}\b/i,            // e.g., f-150
            /\b\d{3,4}\b/i,                  // e.g., 911, 328
            /\b[a-z]{1,2}[x]\d{1,2}\b/i      // e.g., rx350, qx60
          ];
          
          for (const pattern of modelPatterns) {
            const patternMatch = afterMakeText.match(pattern);
            if (patternMatch) {
              modelMatch = patternMatch[0];
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
    }
    
    // Check for VIN patterns (17 characters, alphanumeric except I, O, Q)
    const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/i;
    const vinMatch = message.match(vinPattern);
    if (vinMatch) {
      return {
        year: 'Unknown', // VIN can be decoded with an API call
        make: 'Unknown', // VIN can be decoded with an API call
        model: 'VIN: ' + vinMatch[0]
      };
    }
    
    // Return null if we couldn't extract vehicle info
    return null;
  };

  return {
    extractVehicleInfo
  };
};
