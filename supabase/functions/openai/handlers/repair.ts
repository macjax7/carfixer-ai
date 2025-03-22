
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleRepairGuidance(data: any) {
  try {
    const { repairType, vehicleInfo, partName = null, dtcCode = null } = data;
    
    const systemPrompt = 'You are a master automotive technician with decades of experience. Provide detailed step-by-step repair guidance that is accurate, comprehensive and safety-focused. Focus on providing specific information for the vehicle mentioned in the user query. Avoid generic advice that isn\'t relevant to their specific vehicle.';
    
    let userPrompt = `I need a step-by-step guide for ${repairType} `;
    if (vehicleInfo && Object.keys(vehicleInfo).length > 0) {
      userPrompt += `on a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.engine ? ` with a ${vehicleInfo.engine} engine` : ''}. `;
      userPrompt += 'Your instructions should be tailored to this specific vehicle.';
    }
    
    if (partName) {
      userPrompt += `The repair involves the ${partName}. `;
    }
    
    if (dtcCode) {
      userPrompt += `This is related to diagnostic trouble code ${dtcCode}. `;
    }
    
    userPrompt += 'Please include: 1) Tools needed for this vehicle, 2) Difficulty level, 3) Estimated time, 4) Safety precautions, 5) Step-by-step instructions with detail, and 6) Tips for success with this specific make and model.';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.4,
      }),
    });

    const result = await response.json();
    
    return createSuccessResponse({
      guidance: result.choices[0].message.content,
      usage: result.usage
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
