
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleRepairGuidance(data: any) {
  try {
    const { repairType, vehicleInfo, partName = null, dtcCode = null } = data;
    
    const systemPrompt = `You are a master automotive technician with decades of experience. Provide detailed step-by-step repair guidance that is accurate, comprehensive and safety-focused.

CRITICAL FORMATTING REQUIREMENTS:
- Use clear section headers for each major section (## Tools Needed, ## Difficulty Level, ## Safety Precautions, etc.)
- Use bullet points (•) for tools, materials, and important notes
- Use numbered steps (1., 2., 3.) for procedure walkthroughs
- Bold any warnings or critical safety information
- Use conversational guidance phrases like "Here's what you should check next..." or "If that doesn't fix it, try this..."
- Focus on providing specific information for the vehicle mentioned in the user query
- Avoid generic advice that isn't relevant to their specific vehicle`;
    
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
    
    userPrompt += `Include EACH of these sections with proper formatting:
1. Tools & Materials Needed (list as bullet points)
2. Difficulty Level (Easy/Moderate/Advanced)
3. Estimated Time
4. Safety Precautions (list as bullet points)
5. Step-by-Step Instructions (use numbered steps with clear headers for major phases)
6. Tips for Success specific to this ${vehicleInfo?.make || ''} ${vehicleInfo?.model || ''}
7. Troubleshooting Common Issues`;
    
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
      usage: result.usage,
      format: 'structured'
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
