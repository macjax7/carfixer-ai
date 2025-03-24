
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleChatRequest(data: any) {
  try {
    console.log("Chat handler received data:", JSON.stringify(data));
    
    const { messages, includeVehicleContext = false, vehicleInfo = {}, messageHistory = [] } = data;
    
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
    
    // If repair or diagnostic query with no vehicle mention, prompt for vehicle
    if ((isRepairOrDiagnosticQuery || hasDTCQuery) && !hasVehicleMention && !vehicleInfo?.make) {
      return createSuccessResponse({
        message: generateVehiclePrompt(),
        requestVehicleInfo: true
      });
    }
    
    // Modified system prompt to be more cautious about assuming vehicle context
    let systemPrompt = 'You are CarFix AI, an automotive diagnostic assistant. Provide helpful, accurate advice about vehicle problems, maintenance, and repairs. Always be clear when a repair requires professional help.';
    
    // Updated to encourage focusing on the specific vehicle mentioned in the query, not just saved vehicles
    systemPrompt += ' IMPORTANT: Focus on the specific vehicle the user is asking about in their query. If the user has not specified a vehicle and you need vehicle-specific information to provide an accurate answer, politely ask which vehicle they are working on.';
    
    // Enhanced instructions for OBD codes
    systemPrompt += ' When you identify OBD-II diagnostic trouble codes (like P0300, B1234, C0123, U0123) in the user\'s message, provide comprehensive analysis including: 1) Code meaning specific to their vehicle, 2) Affected components, 3) Common causes in order of likelihood, 4) Diagnostic steps in order of simplicity, 5) Repair difficulty, 6) Estimated repair costs, 7) Related codes that often appear together, and 8) Preventative measures.';
    
    // Only include the user's selected vehicle as context if relevant, but don't assume it's the one they're asking about
    if (includeVehicleContext && vehicleInfo && Object.keys(vehicleInfo).length > 0) {
      systemPrompt += ` The user's vehicle is a ${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}. Keep this vehicle in the context of the conversation unless they explicitly mention a different vehicle.`;
    }

    // If the user is asking about DTCs, add the codes to the system prompt
    if (hasDTCQuery) {
      systemPrompt += ` The user is asking about the following diagnostic trouble code(s): ${dtcCodes.join(', ')}. Provide detailed analysis for each.`;
    }

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

// Helper functions

// Check if the user has mentioned a vehicle in their messages
function checkForVehicleMention(currentMessage: string, messageHistory: string[] = []): boolean {
  // Common car makes
  const carMakes = [
    'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'hyundai', 'kia', 
    'subaru', 'bmw', 'mercedes', 'audi', 'lexus', 'acura', 'mazda', 'volkswagen', 
    'vw', 'jeep', 'ram', 'dodge', 'chrysler', 'buick', 'cadillac', 'gmc', 'infiniti'
  ];
  
  // Check for year patterns (like "2011" or "'18")
  const yearPattern = /\b(19|20)\d{2}\b|'\d{2}\b/i;
  
  // Check for make/model combinations
  const makeModelPattern = new RegExp(`\\b(${carMakes.join('|')})\\s+[a-z0-9]+\\b`, 'i');
  
  // Check current message
  if (yearPattern.test(currentMessage) || makeModelPattern.test(currentMessage)) {
    return true;
  }
  
  // Check message history
  for (const message of messageHistory) {
    if (yearPattern.test(message) || makeModelPattern.test(message)) {
      return true;
    }
  }
  
  return false;
}

// Check if the query is about a repair or diagnostic procedure
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
  
  // Check for repair terms
  const repairPattern = new RegExp(`\\b(${repairTerms.join('|')})\\b`, 'i');
  
  // Check for part terms
  const partPattern = new RegExp(`\\b(${partTerms.join('|')})\\b`, 'i');
  
  // If message contains both a repair term and a part term, it's likely a repair query
  return repairPattern.test(message) && partPattern.test(message);
}

// Extract OBD-II codes from user message
function extractDTCCodes(message: string): string[] {
  // Pattern for OBD-II codes: P, B, C, or U followed by 4 digits
  const dtcPattern = /\b[PBCU][0-9]{4}\b/gi;
  const matches = message.match(dtcPattern) || [];
  
  // Return unique codes only
  return [...new Set(matches.map(code => code.toUpperCase()))];
}

// Generate a random vehicle prompt
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
