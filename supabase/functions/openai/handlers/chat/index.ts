import { corsHeaders, createSuccessResponse, createErrorResponse } from '../../utils.ts';
import { checkForVehicleMention } from './vehicle-detection.ts';
import { checkForRepairOrDiagnosticQuery, checkForComponentLocationQuery } from './query-detection.ts';
import { extractDTCCodes } from './code-detection.ts';
import { generateVehiclePrompt } from './prompt-generator.ts';
import { buildSystemPrompt } from './system-prompt-builder.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

/**
 * Handle chat requests to the OpenAI API
 */
export async function handleChatRequest(data: any) {
  try {
    console.log("Chat handler received data:", JSON.stringify(data));
    
    const { 
      messages, 
      includeVehicleContext = false, 
      vehicleInfo = null, 
      messageHistory = [],
      useHighQualityModel = false 
    } = data;
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided for chat request');
    }
    
    // Check if this is the first message or a very generic question
    const userMessage = messages[messages.length - 1].content;
    
    console.log("Processing user message:", userMessage);
    
    // Check if the user has mentioned a vehicle in their current query or previous messages
    const hasVehicleMention = checkForVehicleMention(userMessage, messageHistory);
    console.log("Vehicle mention detected:", hasVehicleMention);
    
    // Check if the user is asking about a specific repair procedure or diagnostic
    const isRepairOrDiagnosticQuery = checkForRepairOrDiagnosticQuery(userMessage);
    console.log("Repair or diagnostic query detected:", isRepairOrDiagnosticQuery);
    
    // Check for OBD-II code patterns in the message
    const dtcCodes = extractDTCCodes(userMessage);
    const hasDTCQuery = dtcCodes.length > 0;
    console.log("DTC codes detected:", dtcCodes, "Has DTC query:", hasDTCQuery);
    
    // Check if the user is asking for a component location or diagram
    const isComponentLocationQuery = checkForComponentLocationQuery(userMessage);
    console.log("Component location query detected:", isComponentLocationQuery);
    
    // Only prompt for vehicle if we have no vehicle context AND it's a repair/diagnostic query
    const hasVehicleContext = vehicleInfo && Object.keys(vehicleInfo).length > 0;
    console.log("Has vehicle context:", hasVehicleContext, "Vehicle info:", vehicleInfo);
    
    if ((isRepairOrDiagnosticQuery || hasDTCQuery || isComponentLocationQuery) && !hasVehicleMention && !hasVehicleContext) {
      console.log("No vehicle context, prompting for vehicle info");
      return createSuccessResponse({
        message: generateVehiclePrompt(),
        requestVehicleInfo: true
      });
    }
    
    // Build the system prompt based on the query context
    const systemPrompt = buildSystemPrompt(
      hasVehicleContext,
      hasVehicleMention,
      isComponentLocationQuery,
      hasDTCQuery,
      dtcCodes,
      vehicleInfo
    );

    const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured in environment variables');
      throw new Error('OpenAI API key is not configured');
    }

    // Always use GPT-4o for specialized queries or if high quality is requested
    // Otherwise, use GPT-4o-mini for general questions as a fallback
    const shouldUseGPT4o = hasDTCQuery || 
                         isComponentLocationQuery || 
                         isRepairOrDiagnosticQuery ||
                         useHighQualityModel;
                         
    const modelToUse = shouldUseGPT4o ? 'gpt-4o' : 'gpt-4o-mini';
      
    console.log(`Using model: ${modelToUse} for query type: ${
      hasDTCQuery ? 'DTC code' : isComponentLocationQuery ? 'component location' : 
      isRepairOrDiagnosticQuery ? 'repair guide' : 'general'
    }, high quality flag: ${useHighQualityModel}`);
    
    console.log("Sending request to OpenAI with system prompt (first 500 chars):", systemPrompt.substring(0, 500) + "...");
    console.log("User messages count:", messages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: requestMessages,
        temperature: 0.7,
        max_tokens: 1500,  // Increased token limit for more detailed responses
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log("Received response from OpenAI, tokens used:", result.usage?.total_tokens || 'unknown');
    console.log("OpenAI response content (first 300 chars):", result.choices[0].message.content.substring(0, 300) + "...");
    
    // Add error checking for the response structure
    if (!result || !result.choices || !result.choices[0] || !result.choices[0].message) {
      console.error('Unexpected response structure from OpenAI:', result);
      throw new Error('Invalid response from OpenAI');
    }
    
    return createSuccessResponse({
      message: result.choices[0].message.content,
      usage: result.usage,
      model: modelToUse
    });
  } catch (error) {
    console.error('Error in chat handler:', error);
    return createErrorResponse(error);
  }
}
