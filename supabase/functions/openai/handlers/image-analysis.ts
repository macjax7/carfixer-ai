
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleImageAnalysis(data: any) {
  try {
    const { image, prompt = 'Identify this car part and explain its purpose.' } = data;
    
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
            content: 'You are CarFix AI, an automotive part identification specialist. Analyze the provided image and identify the car part shown. Explain what it does, common failure symptoms, and how difficult it is to replace.'
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
