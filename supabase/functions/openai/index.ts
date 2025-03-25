import { corsHeaders, createSuccessResponse, createErrorResponse } from './utils.ts';

// Import handlers
import { handleChatRequest } from './handlers/chat.ts';
import { handleImageAnalysisRequest } from './handlers/image-analysis.ts';
import { handlePartLookupRequest } from './handlers/part-lookup.ts';
import { handleRepairRequest } from './handlers/repair.ts';
import { handleVehicleInfoRequest } from './handlers/vehicle-info.ts';
import { handleVehicleListingRequest } from './handlers/vehicle-listing.ts';
import { handleRepairDataRequest } from './handlers/repair-data.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { service, action, data } = await req.json();
    
    console.log(`OpenAI function request received: ${service}/${action}`);
    
    // Route to appropriate handler based on service and action
    switch (service) {
      case 'diagnostic':
        if (action === 'chat') {
          return await handleChatRequest(data);
        }
        break;
      case 'image':
        if (action === 'analyze') {
          return await handleImageAnalysisRequest(data);
        }
        break;
      case 'parts':
        if (action === 'lookup') {
          return await handlePartLookupRequest(data);
        }
        break;
      case 'repair':
        if (action === 'guide') {
          return await handleRepairRequest(data);
        } else if (action === 'getData') {
          return await handleRepairDataRequest(data);
        }
        break;
      case 'vehicle':
        if (action === 'info') {
          return await handleVehicleInfoRequest(data);
        }
        break;
      case 'listing':
        if (action === 'analyze') {
          return await handleVehicleListingRequest(data);
        }
        break;
      default:
        throw new Error(`Unknown service: ${service}`);
    }
    
    throw new Error(`Unknown action for service ${service}: ${action}`);
  } catch (error) {
    console.error('Error in OpenAI function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
