
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { corsHeaders, createErrorResponse } from './utils.ts';
import { handleChatRequest } from './handlers/chat.ts';
import { handleImageAnalysis } from './handlers/image-analysis.ts';
import { handleDiagnosticRequest } from './handlers/diagnostic.ts';
import { handlePartLookup } from './handlers/part-lookup.ts';
import { handleRepairGuidance } from './handlers/repair.ts';
import { handleVehicleInfo } from './handlers/vehicle-info.ts';
import { handleUserProfile } from './handlers/user-profile.ts';
import { handleVehicleListing } from './handlers/vehicle-listing.ts';

/**
 * Main API Gateway for CarFix AI services
 * Routes requests to the appropriate microservice handler
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { service, action, data } = await req.json();

    // Route requests to the appropriate service
    switch (service) {
      case 'auth':
        // Auth service is handled by Supabase Auth directly, but we could add custom handlers here
        throw new Error('Auth service endpoints not implemented in this function');
      
      case 'vehicle':
        switch (action) {
          case 'listing-analysis':
            return handleVehicleListing(data);
          default:
            return handleVehicleInfo(action, data);
        }
      
      case 'diagnostic':
        switch (action) {
          case 'analyze':
            return handleDiagnosticRequest(data);
          case 'chat':
            return handleChatRequest(data);
          default:
            throw new Error(`Invalid diagnostic action: ${action}`);
        }
      
      case 'image':
        switch (action) {
          case 'analyze':
            return handleImageAnalysis(data);
          default:
            throw new Error(`Invalid image action: ${action}`);
        }
      
      case 'parts':
        switch (action) {
          case 'lookup':
            return handlePartLookup(data);
          default:
            throw new Error(`Invalid parts action: ${action}`);
        }
      
      case 'repair':
        switch (action) {
          case 'guide':
            return handleRepairGuidance(data);
          default:
            throw new Error(`Invalid repair action: ${action}`);
        }
      
      case 'user':
        return handleUserProfile(action, data);
      
      // Legacy direct action routing for backward compatibility
      case undefined:
        if (action) {
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
            case 'analyze-listing':
              return handleVehicleListing(data);
            default:
              throw new Error(`Invalid legacy action: ${action}`);
          }
        }
        
      default:
        throw new Error(`Invalid service: ${service}`);
    }
  } catch (error) {
    console.error('Error in API Gateway:', error);
    return createErrorResponse(error);
  }
});
