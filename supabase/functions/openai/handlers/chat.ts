
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

export async function handleChatRequest(data: any) {
  try {
    console.log("Chat handler received data:", JSON.stringify(data));
    
    const { 
      messages, 
      includeVehicleContext = false, 
      vehicleInfo = null, 
      messageHistory = [],
      systemPrompt = null
    } = data;
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided for chat request');
    }
    
    // Set up a default system prompt if none provided
    let effectiveSystemPrompt = systemPrompt || 'You are CarFix AI, an automotive diagnostic assistant. Provide helpful, accurate advice about vehicle problems, maintenance, and repairs.';
    
    // Include vehicle context if available
    if (vehicleInfo && Object.keys(vehicleInfo).length > 0) {
      effectiveSystemPrompt += ` The user is asking about their ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}.`;
    }

    // Build complete message array
    const requestMessages = [
      { role: 'system', content: effectiveSystemPrompt },
      ...messages
    ];

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured in environment variables');
      throw new Error('OpenAI API key is not configured');
    }

    console.log("Using model: gpt-4o-mini");
    console.log("Sending request to OpenAI with messages count:", requestMessages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the newer, more reliable model
        messages: requestMessages,
        temperature: 0.7,
        timeout: 60000, // Increase timeout to 60 seconds
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log("Received response from OpenAI successfully");
    
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
