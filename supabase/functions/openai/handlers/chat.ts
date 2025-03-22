
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleChatRequest(data: any) {
  try {
    const { messages, includeVehicleContext = false, vehicleInfo = {} } = data;
    
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided for chat request');
    }
    
    let systemPrompt = 'You are CarFix AI, an automotive diagnostic assistant. Provide helpful, accurate advice about vehicle problems, maintenance, and repairs. Always be clear when a repair requires professional help.';
    
    if (includeVehicleContext && vehicleInfo) {
      systemPrompt += ` The user's vehicle is a ${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}.`;
    }

    const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
