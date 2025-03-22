
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, createErrorResponse } from './utils.ts';
import { handleChatRequest } from './handlers/chat.ts';
import { handleImageAnalysis } from './handlers/image-analysis.ts';
import { handleDiagnosticRequest } from './handlers/diagnostic.ts';
import { handlePartLookup } from './handlers/part-lookup.ts';
import { handleRepairGuidance } from './handlers/repair.ts';

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
    return createErrorResponse(error);
  }
});
