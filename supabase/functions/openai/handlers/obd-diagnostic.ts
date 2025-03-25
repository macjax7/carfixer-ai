
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

Your task is to analyze the provided OBD-II code(s) and provide a comprehensive diagnostic report with the following structure:

1. LAYERED EXPLANATION (for each code):
   - COMPONENT: What is the affected component/system (explain in simple terms)
   - MEANING: What the code actually indicates is happening
   - IMPACT: Why this matters (performance, safety, emissions, etc.)

2. COMMON CAUSES: Ranked most to least likely for this specific vehicle
   
3. DIAGNOSTIC STEPS: Step-by-step procedures for confirming the exact cause
   
4. REPAIR OPTIONS:
   - DIY DIFFICULTY: Rating from 1-5 with explanation
   - PARTS NEEDED: With estimated costs
   - PROFESSIONAL REPAIR: Estimated cost range
   
5. PREVENTION TIPS: How to avoid this issue in the future

6. SEVERITY ASSESSMENT:
   - DRIVABILITY: Can the vehicle be safely driven? What are the risks?
   - URGENCY: Timeframe for addressing the issue

Include relevant repair procedures specific to the ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model}. Provide technical details like torque specifications, part numbers, and special tools when applicable.

Use everyday analogies to explain complex concepts, and ensure your response is conversational and educational. Include clear steps that a non-mechanic could understand, while providing enough technical detail for more advanced users.`;

    const userPrompt = `I need diagnosis help with the following OBD-II code(s) on my ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model}: ${codes.join(', ')}
    
${symptoms.length > 0 ? `Additional symptoms: ${symptoms.join(', ')}` : ''}

Please provide a layered explanation of what these codes mean (in simple terms first, then technical details), what components are involved, why this matters, and a step-by-step guide for diagnosis and repair specific to my vehicle.`;

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured in environment variables');
      throw new Error('OpenAI API key is not configured');
    }

    console.log("Sending OBD diagnostic request to OpenAI");
    
    try {
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
      console.error('Error in OpenAI API request:', error);
      
      // Return a fallback response that mentions the API error
      return createSuccessResponse({
        analysis: `I'm sorry, I encountered an error connecting to the diagnostic service. Please try again in a moment. If the problem persists, you can try these general steps for the codes ${codes.join(', ')}:\n\n1. Check your vehicle's service manual for these specific codes\n2. Consider using an OBD scanner to clear the codes and see if they return\n3. For more specific help, please try your request again later`,
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error in OBD diagnostic handler:', error);
    return createErrorResponse(error);
  }
}
