
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

export async function handleRepairDataRequest(data: any) {
  try {
    console.log("Repair data handler received data:", JSON.stringify(data));
    
    const { vehicleInfo, task } = data;
    
    if (!vehicleInfo || !vehicleInfo.make || !vehicleInfo.model || !vehicleInfo.year) {
      throw new Error('Insufficient vehicle information provided');
    }
    
    // Create a prompt for OpenAI to generate repair data
    const prompt = buildRepairDataPrompt(vehicleInfo, task);
    
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured in environment variables');
      throw new Error('OpenAI API key is not configured');
    }

    // Call OpenAI to generate repair data
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Using a more capable model for technical data
        messages: [
          {
            role: 'system',
            content: 'You are an automotive technical database. Provide detailed, accurate repair information for specific vehicles and tasks in JSON format. Include only factual information that would be found in a professional repair manual.'
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,  // Lower temperature for more consistent, factual responses
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log("Received response from OpenAI for repair data");
    
    // Extract the JSON from the response
    const repairData = JSON.parse(result.choices[0].message.content);
    
    return createSuccessResponse({
      repairData
    });
  } catch (error) {
    console.error('Error in repair data handler:', error);
    return createErrorResponse(error);
  }
}

/**
 * Build a prompt for generating repair data
 */
function buildRepairDataPrompt(vehicleInfo: any, task?: string): string {
  const vehicleDescription = `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`;
  
  // Base prompt for retrieving repair data
  let prompt = `Generate detailed repair information for a ${vehicleDescription}.`;
  
  // Add task-specific guidance if a task is provided
  if (task) {
    prompt += ` The specific repair task is: ${task}.`;
  } else {
    prompt += ` Provide common maintenance information for this vehicle.`;
  }
  
  // Specify exactly what information we need
  prompt += `
  
Provide the following information in JSON format:

1. "procedure": A step-by-step procedure for performing the repair or maintenance (if applicable)
2. "torqueSpecs": An object containing torque specifications for relevant fasteners (e.g., {"oil drain plug": "25-30 ft-lbs", "wheel lug nuts": "95-100 ft-lbs"})
3. "fluidTypes": An object with OEM recommended fluid types and capacities (e.g., {"engine oil": "5W-30, 5.5 quarts", "transmission fluid": "Dexron VI, 12 quarts"})
4. "partNumbers": An object with common part numbers or specifications (e.g., {"oil filter": "PH7317", "air filter": "CA10755"})
5. "toolsRequired": An array of tools needed for the job
6. "safetyNotes": An array of important safety considerations
7. "estimatedTime": Estimated time to complete the job for an average DIY mechanic

Only include information that you are certain is accurate and specific to this exact vehicle. Do not include generic information. If you don't have specific information for a field, omit that field entirely rather than providing potentially inaccurate data.

Format the response as a valid JSON object with these fields.`;

  return prompt;
}
