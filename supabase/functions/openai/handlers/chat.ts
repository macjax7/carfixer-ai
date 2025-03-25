import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

export async function handleChatRequest(data: any) {
  try {
    console.log("Chat handler received data:", JSON.stringify(data));
    
    const { messages, includeVehicleContext = false, vehicleInfo = null, messageHistory = [] } = data;
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided for chat request');
    }
    
    // Check if this is the first message or a very generic question
    const userMessage = messages[messages.length - 1].content;
    
    // Check if the user has mentioned a vehicle in their current query or previous messages
    const hasVehicleMention = checkForVehicleMention(userMessage, messageHistory);
    
    // Check if the user is asking about a specific repair procedure or diagnostic
    const isRepairOrDiagnosticQuery = checkForRepairOrDiagnosticQuery(userMessage);
    
    // Check for OBD-II code patterns in the message
    const dtcCodes = extractDTCCodes(userMessage);
    const hasDTCQuery = dtcCodes.length > 0;
    
    // Check if the user is asking for a component location or diagram
    const isComponentLocationQuery = checkForComponentLocationQuery(userMessage);
    
    // Only prompt for vehicle if we have no vehicle context AND it's a repair/diagnostic query
    const hasVehicleContext = vehicleInfo && Object.keys(vehicleInfo).length > 0;
    
    if ((isRepairOrDiagnosticQuery || hasDTCQuery || isComponentLocationQuery) && !hasVehicleMention && !hasVehicleContext) {
      console.log("No vehicle context, prompting for vehicle info");
      return createSuccessResponse({
        message: generateVehiclePrompt(),
        requestVehicleInfo: true
      });
    }
    
    // Modified system prompt to maintain vehicle context and allow component diagrams and video recommendations
    let systemPrompt = 'You are CarFix AI, an automotive diagnostic assistant. Provide helpful, accurate advice about vehicle problems, maintenance, and repairs. Always be clear when a repair requires professional help. When users ask about component locations or "where is X", include a component diagram with your response by using the format {COMPONENT_DIAGRAM: {"componentName": "name of part", "location": "brief description of location", "diagramUrl": "URL to diagram image"}}. For any repair procedure or diagnostic issue, ALWAYS recommend at least one relevant YouTube video with your response. Format YouTube video links as markdown: [Descriptive Title of Video](https://www.youtube.com/watch?v=VIDEO_ID). You should aim to recommend multiple videos when possible, especially for complex repairs.';
    
    // Always include vehicle context if available - don't ask again
    if (hasVehicleContext) {
      console.log("Using provided vehicle context:", vehicleInfo);
      systemPrompt += ` The user is asking about their ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. Keep this vehicle in context throughout the entire conversation and do not ask for vehicle information again unless they explicitly mention a different vehicle.`;
    } else if (hasVehicleMention) {
      // If they mentioned a vehicle but we don't have structured info, still avoid asking again
      console.log("User mentioned a vehicle but no structured info provided");
      systemPrompt += ` The user has mentioned a specific vehicle. Don't ask for vehicle information again unless they explicitly mention a different vehicle.`;
    } else {
      // Only in this case should we potentially ask for vehicle info
      console.log("No vehicle context detected");
      systemPrompt += ' If the user has not specified a vehicle and you need vehicle-specific information to provide an accurate answer, politely ask which vehicle they are working on.';
    }
    
    // Enhanced instructions for OBD codes
    if (hasDTCQuery) {
      systemPrompt += ` The user is asking about the following diagnostic trouble code(s): ${dtcCodes.join(', ')}. Provide detailed analysis for each.`;
    }
    
    // Add component diagram instructions for location queries
    if (isComponentLocationQuery) {
      systemPrompt += ` The user is asking about the location of a component. Please provide a diagram using the {COMPONENT_DIAGRAM} format described earlier. For example: {COMPONENT_DIAGRAM: {"componentName": "Oil Filter", "location": "Located on the passenger side of the engine block", "diagramUrl": "https://example.com/oil-filter-diagram.jpg"}}. Use appropriate stock diagrams that accurately show the component location.`;
    }
    
    // Add video recommendation instructions for all repair-related queries
    systemPrompt += ` For ANY repair, diagnostic, or maintenance question, you MUST include at least one relevant YouTube video recommendation using markdown links [Video Title](URL). When recommending videos, try to suggest videos that are high quality, instructional, and relevant to their specific vehicle when possible. Prioritize videos that show the actual repair or diagnostic process.`;

    const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured in environment variables');
      throw new Error('OpenAI API key is not configured');
    }

    console.log(`Using model: ${hasDTCQuery ? 'gpt-4o' : 'gpt-4o-mini'}`);
    console.log("Sending request to OpenAI with messages:", JSON.stringify(requestMessages));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: hasDTCQuery ? 'gpt-4o' : 'gpt-4o-mini',
        messages: requestMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log("Received response from OpenAI:", JSON.stringify(result));
    
    // Add error checking for the response structure
    if (!result || !result.choices || !result.choices[0] || !result.choices[0].message) {
      console.error('Unexpected response structure from OpenAI:', result);
      throw new Error('Invalid response from OpenAI');
    }
    
    return createSuccessResponse({
      message: result.choices[0].message.content,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error in chat handler:', error);
    return createErrorResponse(error);
  }
}

function checkForVehicleMention(currentMessage: string, messageHistory: string[] = []): boolean {
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

function checkForRepairOrDiagnosticQuery(message: string): boolean {
  const repairTerms = [
    'fix', 'repair', 'replace', 'install', 'remove', 'change', 'maintenance',
    'how to', 'steps', 'procedure', 'guide', 'instructions',
    'broken', 'issue', 'problem', 'check', 'diagnose', 'troubleshoot'
  ];
  
  const partTerms = [
    'brake', 'engine', 'transmission', 'tire', 'wheel', 'battery', 'starter',
    'alternator', 'radiator', 'coolant', 'oil', 'filter', 'spark plug',
    'ignition', 'sensor', 'pump', 'belt', 'hose', 'light', 'fuse'
  ];
  
  const repairPattern = new RegExp(`\\b(${repairTerms.join('|')})\\b`, 'i');
  
  const partPattern = new RegExp(`\\b(${partTerms.join('|')})\\b`, 'i');
  
  return repairPattern.test(message) && partPattern.test(message);
}

function checkForComponentLocationQuery(message: string): boolean {
  // Check for location-related terms
  const locationTerms = [
    'where is', 'location of', 'find', 'locate', 'position of', 'where can i find', 
    'where\'s the', 'where are', 'show me', 'diagram', 'schematic', 'placement'
  ];
  
  // Common automotive components
  const componentTerms = [
    'sensor', 'filter', 'pump', 'relay', 'fuse', 'valve', 'solenoid', 'switch',
    'thermostat', 'belt', 'pulley', 'battery', 'alternator', 'starter', 'spark plug',
    'injector', 'throttle body', 'mass air flow', 'maf', 'egr', 'pcv', 'evap',
    'oxygen sensor', 'o2 sensor', 'camshaft', 'crankshaft', 'knock sensor', 'vvt',
    'timing chain', 'timing belt', 'water pump', 'oil filter', 'air filter', 'cabin filter'
  ];
  
  const locationPattern = new RegExp(`\\b(${locationTerms.join('|')})\\b`, 'i');
  const componentPattern = new RegExp(`\\b(${componentTerms.join('|')})\\b`, 'i');
  
  return locationPattern.test(message) && componentPattern.test(message);
}

function extractDTCCodes(message: string): string[] {
  const dtcPattern = /\b[PBCU][0-9]{4}\b/gi;
  const matches = message.match(dtcPattern) || [];
  
  return [...new Set(matches.map(code => code.toUpperCase()))];
}

function generateVehiclePrompt(): string {
  const prompts = [
    "Which vehicle are you working on? I can provide more specific advice if you share the year, make, and model.",
    "I'd like to help with that. What's the year, make, and model of your vehicle so I can give you the most accurate information?",
    "To give you the best guidance, could you tell me which vehicle you're asking about? The year, make, and model would be helpful.",
    "For me to provide specific instructions, I'll need to know what vehicle you're working with. Can you share the year, make, and model?",
    "Different vehicles have different procedures. What's the year, make, and model of the vehicle you're working on?"
  ];
  
  return prompts[Math.floor(Math.random() * prompts.length)];
}
