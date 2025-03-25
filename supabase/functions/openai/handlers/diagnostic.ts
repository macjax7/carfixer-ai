
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleDiagnosticRequest(data: any) {
  try {
    const { dtcCode, vehicleInfo, symptoms = [], noStart = false } = data;
    
    let systemPrompt = 'You are CarFix AI, an expert automotive diagnostic technician with deep knowledge of OBD-II diagnostic trouble codes, vehicle systems, and repair procedures. Provide detailed, accurate diagnostics and repair guidance.';
    
    // Add instructions for layered explanations
    systemPrompt += ' ALWAYS STRUCTURE YOUR RESPONSE IN LAYERS: 1) Explain what the component is in simple terms anyone can understand. 2) Explain what the code means technically. 3) Explain why it matters (impact on vehicle). 4) Provide likely causes in order of probability. 5) Recommend next steps from simplest/cheapest to more complex.';
    
    // Add instructions to focus on the specifically mentioned vehicle
    systemPrompt += ' IMPORTANT: Focus on the specific vehicle mentioned in the user\'s query. Provide detailed information tailored to the exact make, model, and year they ask about. Avoid generic advice that isn\'t relevant to their specific vehicle.';
    
    // Enhanced diagnostic capabilities for OBD-II codes
    systemPrompt += ' When analyzing diagnostic trouble codes (DTCs), provide comprehensive analysis including: 1) Detailed code meaning specific to the vehicle, 2) Affected components and systems, 3) Common causes in order of likelihood for this specific make/model/year, 4) Diagnostic steps in order of simplicity and cost-effectiveness, 5) Repair difficulty rating (1-5), 6) Estimated repair costs (DIY vs professional), 7) Related codes that often appear together, and 8) Preventative measures to avoid future occurrences.';
    
    // Use analogies to enhance understanding
    systemPrompt += ' ALWAYS use everyday analogies to explain complex systems. For example: "The catalytic converter is like the lungs of your exhaust system, cleaning harmful gases before they exit your vehicle."';
    
    // Build a comprehensive context for the AI
    let userPrompt = '';
    
    if (dtcCode) {
      userPrompt += `Please explain diagnostic trouble code ${dtcCode} in detail for the vehicle information provided. `;
      userPrompt += 'Include: 1) What this code means for this specific vehicle, 2) The affected system in this vehicle, 3) Common causes for this specific make/model, 4) Diagnostic steps tailored to this vehicle, 5) Repair difficulty level for this vehicle, 6) Estimated repair costs for DIY vs. professional repair, 7) Related codes that might appear with this one, and 8) How to prevent this issue in the future.';
    } else if (noStart) {
      userPrompt += 'My vehicle will not start. ';
      if (symptoms.length > 0) {
        userPrompt += `I'm experiencing these symptoms: ${symptoms.join(', ')}. `;
      }
      userPrompt += 'Please provide a step-by-step diagnostic procedure specific to my vehicle to identify the cause, starting with the most common and simple causes to check first.';
    } else if (symptoms.length > 0) {
      userPrompt += `My vehicle is having these issues: ${symptoms.join(', ')}. Please help diagnose the potential problems and recommend next steps specifically for my vehicle.`;
    }
    
    if (vehicleInfo && Object.keys(vehicleInfo).length > 0) {
      userPrompt += ` This is for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.engine ? ` with a ${vehicleInfo.engine} engine` : ''}.`;
      userPrompt += ' Please tailor your response to this specific vehicle.';
    }
    
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
        temperature: 0.3,
      }),
    });

    const result = await response.json();
    
    return createSuccessResponse({
      diagnostic: result.choices[0].message.content,
      usage: result.usage
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
