
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleImageAnalysis(data: any) {
  try {
    const { image, prompt = 'Identify this car part and explain its purpose.', vehicleInfo = null } = data;
    
    let systemPrompt = 'You are CarFix AI, an automotive part identification specialist. Analyze the provided image and identify the car part shown.';
    
    // Add vehicle specificity instructions
    if (vehicleInfo) {
      systemPrompt += ` Your analysis should be specifically for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. Focus ONLY on this specific vehicle model and year. Do not mention other vehicles or provide general information that isn't specific to this vehicle.`;
      systemPrompt += ' Explain what the part does in THIS SPECIFIC vehicle, common failure symptoms for THIS model, and how difficult it is to replace in THIS vehicle.';
    } else {
      systemPrompt += ' If vehicle information is provided in the prompt, focus EXCLUSIVELY on that specific vehicle. Do not mention other vehicles or provide general advice not specific to the mentioned vehicle.';
    }
    
    // For image analysis, we use GPT-4o with vision capabilities
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        temperature: 0.5,
      }),
    });

    const result = await response.json();
    
    return createSuccessResponse({
      analysis: result.choices[0].message.content,
      usage: result.usage
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
