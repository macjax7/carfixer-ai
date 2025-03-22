
// Common utility functions for the OpenAI edge function

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to create a standard success response
export function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Helper to create an error response
export function createErrorResponse(error: Error, status = 500) {
  console.error('Error in OpenAI function:', error);
  return new Response(
    JSON.stringify({ error: error.message }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
