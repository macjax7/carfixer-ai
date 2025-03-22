
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleRepairGuidance(data: any) {
  try {
    const { repairType, vehicleInfo, partName = null, dtcCode = null } = data;
    
    const systemPrompt = 'You are a master automotive technician with decades of experience. Provide detailed step-by-step repair guidance that is accurate, comprehensive and safety-focused. IMPORTANT: Your guidance must be EXCLUSIVELY specific to the exact vehicle make, model, and year mentioned. Do NOT include general advice or mention other vehicles in your response.';
    
    let userPrompt = `I need a step-by-step guide for ${repairType} `;
    if (vehicleInfo) {
      userPrompt += `on a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.engine ? ` with a ${vehicleInfo.engine} engine` : ''}. `;
      userPrompt += 'Your instructions must be tailored SPECIFICALLY to this exact vehicle. Do not mention other vehicles or provide general advice not applicable to this specific make/model/year.';
    }
    
    if (partName) {
      userPrompt += `The repair involves the ${partName}. `;
    }
    
    if (dtcCode) {
      userPrompt += `This is related to diagnostic trouble code ${dtcCode}. `;
    }
    
    userPrompt += 'Please include: 1) Tools needed specifically for this vehicle, 2) Difficulty level for this specific model, 3) Estimated time for this particular vehicle, 4) Safety precautions specific to this vehicle, 5) Step-by-step instructions with detail focused exclusively on this vehicle, and 6) Tips for success with this specific make and model.';
    
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
