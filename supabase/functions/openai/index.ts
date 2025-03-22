
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();

    switch (action) {
      case 'chat':
        return handleChatRequest(data);
      case 'analyze-image':
        return handleImageAnalysis(data);
      case 'diagnostic':
        return handleDiagnosticRequest(data);
      case 'part-lookup':
        return handlePartLookup(data);
      case 'repair-guidance':
        return handleRepairGuidance(data);
      default:
        throw new Error('Invalid action specified');
    }
  } catch (error) {
    console.error('Error in OpenAI function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleChatRequest(data) {
  const { messages, includeVehicleContext = false, vehicleInfo = {} } = data;
  
  let systemPrompt = 'You are CarFix AI, an automotive diagnostic assistant. Provide helpful, accurate advice about vehicle problems, maintenance, and repairs. Always be clear when a repair requires professional help.';
  
  if (includeVehicleContext && vehicleInfo) {
    systemPrompt += ` The user's vehicle is a ${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}.`;
  }

  const requestMessages = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: requestMessages,
      temperature: 0.7,
    }),
  });

  const result = await response.json();
  
  return new Response(JSON.stringify({
    message: result.choices[0].message.content,
    usage: result.usage
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleImageAnalysis(data) {
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
  
  return new Response(JSON.stringify({
    analysis: result.choices[0].message.content,
    usage: result.usage
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleDiagnosticRequest(data) {
  const { dtcCode, vehicleInfo, symptoms = [], noStart = false } = data;
  
  let systemPrompt = 'You are CarFix AI, an expert automotive diagnostic technician with deep knowledge of OBD-II diagnostic trouble codes, vehicle systems, and repair procedures. Provide detailed, accurate diagnostics and repair guidance.';
  
  // Build a comprehensive context for the AI
  let userPrompt = '';
  
  if (dtcCode) {
    userPrompt += `Please explain diagnostic trouble code ${dtcCode} in detail. `;
    userPrompt += 'Include: 1) What this code means, 2) The affected system, 3) Common causes, 4) Diagnostic steps, 5) Repair difficulty level, and 6) Estimated repair costs for DIY vs. professional repair.';
  } else if (noStart) {
    userPrompt += 'My vehicle will not start. ';
    if (symptoms.length > 0) {
      userPrompt += `I'm experiencing these symptoms: ${symptoms.join(', ')}. `;
    }
    userPrompt += 'Please provide a step-by-step diagnostic procedure to identify the cause, starting with the most common and simple causes to check first.';
  } else if (symptoms.length > 0) {
    userPrompt += `My vehicle is having these issues: ${symptoms.join(', ')}. Please help diagnose the potential problems and recommend next steps.`;
  }
  
  if (vehicleInfo) {
    userPrompt += ` This is for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.engine ? ` with a ${vehicleInfo.engine} engine` : ''}.`;
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
  
  return new Response(JSON.stringify({
    diagnostic: result.choices[0].message.content,
    usage: result.usage
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handlePartLookup(data) {
  const { partName, vehicleInfo, partNumber = null, oem = true, aftermarket = true } = data;
  
  // In a real implementation, we would query external APIs for parts data
  // For now, we'll use OpenAI to simulate part lookup results
  
  const systemPrompt = 'You are an automotive parts database expert. Provide accurate information about car parts, including part numbers, prices, and compatibility.';
  
  let userPrompt = `I need information about ${partName} `;
  if (vehicleInfo) {
    userPrompt += `for a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.engine ? ` with a ${vehicleInfo.engine} engine` : ''}. `;
  }
  
  if (partNumber) {
    userPrompt += `I have a part number: ${partNumber}. `;
  }
  
  userPrompt += 'Please format the response as a JSON object with the following structure: ';
  userPrompt += '{ "parts": [{ "name": "", "partNumber": "", "brand": "", "price": "", "availability": "", "link": "" }] }';
  userPrompt += ` Include ${oem ? 'OEM' : ''}${oem && aftermarket ? ' and ' : ''}${aftermarket ? 'aftermarket' : ''} options if available.`;
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  const result = await response.json();
  let partsData;
  
  try {
    partsData = JSON.parse(result.choices[0].message.content);
  } catch (e) {
    console.error('Error parsing JSON from OpenAI:', e);
    partsData = { parts: [] };
  }
  
  return new Response(JSON.stringify({
    parts: partsData.parts || [],
    usage: result.usage
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleRepairGuidance(data) {
  const { repairType, vehicleInfo, partName = null, dtcCode = null } = data;
  
  const systemPrompt = 'You are a master automotive technician with decades of experience. Provide detailed step-by-step repair guidance that is accurate, comprehensive and safety-focused.';
  
  let userPrompt = `I need a step-by-step guide for ${repairType} `;
  if (vehicleInfo) {
    userPrompt += `on a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}${vehicleInfo.engine ? ` with a ${vehicleInfo.engine} engine` : ''}. `;
  }
  
  if (partName) {
    userPrompt += `The repair involves the ${partName}. `;
  }
  
  if (dtcCode) {
    userPrompt += `This is related to diagnostic trouble code ${dtcCode}. `;
  }
  
  userPrompt += 'Please include: 1) Tools needed, 2) Difficulty level, 3) Estimated time, 4) Safety precautions, 5) Step-by-step instructions with detail, and 6) Tips for success.';
  
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
  
  return new Response(JSON.stringify({
    guidance: result.choices[0].message.content,
    usage: result.usage
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
