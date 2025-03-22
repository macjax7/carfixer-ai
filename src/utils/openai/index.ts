
// Export types
export { type ChatMessage } from './types';

// Export individual API functions
export {
  sendChatMessage
} from './chat';

export {
  analyzeImage
} from './image';

export {
  analyzeVehicleListing
} from './listing';

export {
  getDiagnosticInfo
} from './diagnostic';

export {
  lookupPart
} from './parts';

export {
  getRepairGuidance
} from './repair';

export {
  decodeVIN,
  getOBDSensorData
} from './vehicle';

export {
  speechToText
} from './speech';

// Export the main hook
export { useOpenAI } from './hook';
