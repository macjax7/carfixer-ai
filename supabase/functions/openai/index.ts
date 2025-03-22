
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

    if (action === 'chat') {
      return handleChatRequest(data);
    } else if (action === 'analyze-image') {
      return handleImageAnalysis(data);
    } else {
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
