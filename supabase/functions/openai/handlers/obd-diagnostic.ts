
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY') || '';

export async function handleOBDDiagnosticRequest(data: any) {
  try {
    console.log("OBD diagnostic handler received data:", JSON.stringify(data));
    
    const { codes, vehicleInfo, symptoms = [] } = data;
    
    if (!codes || codes.length === 0) {
      throw new Error('No OBD codes provided for diagnostic request');
    }
    
    const systemPrompt = `You are CarFix AI, an expert automotive diagnostic technician with deep knowledge of OBD-II diagnostic trouble codes, vehicle systems, and repair procedures. 
    
Your task is to analyze the provided OBD-II code(s) and provide a comprehensive diagnostic report including:
1. Detailed explanation of each code
2. Affected components and systems
3. Common causes ranked by likelihood for this specific vehicle
4. Step-by-step diagnostic procedures
5. Required parts with OEM numbers when applicable
6. Estimated repair costs (DIY vs professional)
7. Repair difficulty rating (1-5)
8. Tools required for diagnosis/repair
9. Recommended repair steps with safety precautions

Include relevant diagrams and visual references where helpful. If you recommend specific video tutorials, provide YouTube links in markdown format: [Title](URL).

Focus EXCLUSIVELY on the ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model} and provide vehicle-specific information including exact component locations, torque specifications, and other technical details relevant to this vehicle.`;

    const userPrompt = `I need diagnostic help with the following OBD-II code(s) on my ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model}: ${codes.join(', ')}
    
${symptoms.length > 0 ? `Additional symptoms: ${symptoms.join(', ')}` : ''}

Please provide a comprehensive analysis of what these codes mean specifically for my vehicle, what components are likely causing the issue, and step-by-step instructions for diagnosing and fixing the problem.`;

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured in environment variables');
      throw new Error('OpenAI API key is not configured');
    }

    console.log("Sending OBD diagnostic request to OpenAI");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Using the most capable model for technical diagnostics
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,  // Lower temperature for more factual, consistent responses
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log("Received OBD diagnostic response from OpenAI");
    
    return createSuccessResponse({
      analysis: result.choices[0].message.content,
      usage: result.usage
    });
  } catch (error) {
    console.error('Error in OBD diagnostic handler:', error);
    return createErrorResponse(error);
  }
}
