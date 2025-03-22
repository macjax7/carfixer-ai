
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleImageAnalysis(data: any) {
  try {
    const { image, prompt = 'Identify this car part and explain its purpose.', vehicleInfo = null } = data;
    
    let systemPrompt = 'You are CarFix AI, an automotive part identification specialist with extensive knowledge of OEM and aftermarket parts. Analyze the provided image and identify the car part shown.';
    
    // Add vehicle specificity instructions when vehicle info is provided
    if (vehicleInfo && Object.keys(vehicleInfo).length > 0) {
      systemPrompt += ` Your analysis should consider the context of a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. Identify the exact part with its OEM part number if possible.`;
      systemPrompt += ' Provide the following information in your response: 1) Part name and exact OEM part number, 2) Function and purpose of this part, 3) Common symptoms when this part fails, 4) Estimated replacement cost (OEM vs aftermarket), 5) Difficulty level for DIY replacement, and 6) Where to purchase replacement parts.';
    } else {
      systemPrompt += ' If a specific vehicle is mentioned in the user prompt, provide information relevant to that vehicle including the OEM part number if possible. Otherwise, provide general information about the part.';
      systemPrompt += ' Structure your response with these sections: 1) Part Identification (name and possible part numbers), 2) Function, 3) Replacement Information, and 4) Purchase Options.';
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
        temperature: 0.2, // Lower temperature for more deterministic, factual responses
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
