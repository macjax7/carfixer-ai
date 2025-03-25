
/**
 * System prompt builder for ChatGPT interactions
 */

interface VehicleInfo {
  year?: string | number;
  make?: string;
  model?: string;
  engine?: string;
}

/**
 * Build a system prompt for the ChatGPT API based on context and query type
 */
export function buildSystemPrompt(
  hasVehicleContext: boolean, 
  hasVehicleMention: boolean, 
  isComponentLocationQuery: boolean,
  hasDTCQuery: boolean,
  dtcCodes: string[] = [],
  vehicleInfo: VehicleInfo | null = null
): string {
  // Base system prompt
  let systemPrompt = 'You are CarFix AI, an automotive diagnostic assistant. Provide helpful, accurate advice about vehicle problems, maintenance, and repairs. Always be clear when a repair requires professional help. When users ask about component locations or "where is X", include a component diagram with your response by using the format {COMPONENT_DIAGRAM: {"componentName": "name of part", "location": "brief description of location", "diagramUrl": "URL to diagram image", "highlightedDiagramUrl": "URL to diagram with the component highlighted or circled"}}. For any repair procedure or diagnostic issue, ALWAYS recommend at least one relevant YouTube video with your response. Format YouTube video links as markdown: [Descriptive Title of Video](https://www.youtube.com/watch?v=VIDEO_ID). You should aim to recommend multiple videos when possible, especially for complex repairs.';
  
  // Add vehicle context if available
  if (hasVehicleContext && vehicleInfo) {
    systemPrompt += ` The user is asking about their ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. Keep this vehicle in context throughout the entire conversation and do not ask for vehicle information again unless they explicitly mention a different vehicle.`;
  } else if (hasVehicleMention) {
    // If they mentioned a vehicle but we don't have structured info, still avoid asking again
    systemPrompt += ` The user has mentioned a specific vehicle. Don't ask for vehicle information again unless they explicitly mention a different vehicle.`;
  } else {
    // Only in this case should we potentially ask for vehicle info
    systemPrompt += ' If the user has not specified a vehicle and you need vehicle-specific information to provide an accurate answer, politely ask which vehicle they are working on.';
  }
  
  // Enhanced instructions for OBD codes
  if (hasDTCQuery && dtcCodes.length > 0) {
    systemPrompt += ` The user is asking about the following diagnostic trouble code(s): ${dtcCodes.join(', ')}. Provide detailed analysis for each.`;
  }
  
  // Add component diagram instructions for location queries
  if (isComponentLocationQuery) {
    systemPrompt += ` The user is asking about the location of a component. Please provide a diagram using the {COMPONENT_DIAGRAM} format described earlier. For example: {COMPONENT_DIAGRAM: {"componentName": "Oil Filter", "location": "Located on the passenger side of the engine block", "diagramUrl": "https://example.com/oil-filter-diagram.jpg", "highlightedDiagramUrl": "https://example.com/oil-filter-diagram-highlighted.jpg"}}. Use appropriate stock diagrams that accurately show the component location. The highlightedDiagramUrl should show the same diagram but with the component highlighted or circled for easy identification.`;
  }
  
  // Add video recommendation instructions for all repair-related queries
  systemPrompt += ` For ANY repair, diagnostic, or maintenance question, you MUST include at least one relevant YouTube video recommendation using markdown links [Video Title](URL). When recommending videos, try to suggest videos that are high quality, instructional, and relevant to their specific vehicle when possible. Prioritize videos that show the actual repair or diagnostic process.`;

  return systemPrompt;
}
