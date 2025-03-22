
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handlePartLookup(data: any) {
  try {
    const { partName, vehicleInfo, partNumber = null, oem = true, aftermarket = true } = data;
    
    // In a real implementation, we would query external APIs for parts data
    // For now, we'll use OpenAI to simulate part lookup results
    
    const systemPrompt = 'You are an automotive parts database expert. Provide accurate information about car parts, including part numbers, prices, and compatibility. Focus on parts that are compatible with the specific vehicle mentioned in the query.';
    
    let userPrompt = `I need information about ${partName} `;
    if (vehicleInfo && Object.keys(vehicleInfo).length > 0) {
      userPrompt += `for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.engine ? ` with a ${vehicleInfo.engine} engine` : ''}. `;
      userPrompt += 'Only provide parts that are compatible with this vehicle.';
    }
    
    if (partNumber) {
      userPrompt += `I have a part number: ${partNumber}. Verify if this is compatible with the vehicle mentioned. `;
    }
    
    userPrompt += 'Please format the response as a JSON object with the following structure: ';
    userPrompt += '{ "parts": [{ "name": "", "partNumber": "", "brand": "", "price": "", "availability": "", "link": "" }] }';
    userPrompt += ` Include ${oem ? 'OEM' : ''}${oem && aftermarket ? ' and ' : ''}${aftermarket ? 'aftermarket' : ''} options if available.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    const result = await response.json();
    let partsData;
    
    try {
      partsData = JSON.parse(result.choices[0].message.content);
    } catch (e) {
      console.error('Error parsing JSON from OpenAI:', e);
      partsData = { parts: [] };
    }
    
    return createSuccessResponse({
      parts: partsData.parts || [],
      usage: result.usage
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
