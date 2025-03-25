
/**
 * Utilities for vehicle mention detection in messages
 */

/**
 * Check if a user has mentioned a vehicle in their current or previous messages
 */
export function checkForVehicleMention(currentMessage: string, messageHistory: string[] = []): boolean {
  const carMakes = [
    'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'hyundai', 'kia', 
    'subaru', 'bmw', 'mercedes', 'audi', 'lexus', 'acura', 'mazda', 'volkswagen', 
    'vw', 'jeep', 'ram', 'dodge', 'chrysler', 'buick', 'cadillac', 'gmc', 'infiniti'
  ];
  
  const yearPattern = /\b(19|20)\d{2}\b|'\d{2}\b/i;
  
  const makeModelPattern = new RegExp(`\\b(${carMakes.join('|')})\\s+[a-z0-9]+\\b`, 'i');
  
  if (yearPattern.test(currentMessage) || makeModelPattern.test(currentMessage)) {
    return true;
  }
  
  for (const message of messageHistory) {
    if (yearPattern.test(message) || makeModelPattern.test(message)) {
      return true;
    }
  }
  
  return false;
}
