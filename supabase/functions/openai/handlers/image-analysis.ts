
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleImageAnalysis(data: any) {
  try {
    console.log("Image analysis handler received request");
    
    // Extract and validate the request data
    const { image, prompt = 'Identify this car part and explain its purpose.', vehicleInfo = null } = data;
    
    if (!image) {
      console.error("No image data provided");
      return createErrorResponse(new Error("No image data provided"));
    }
    
    console.log("Processing image with prompt:", prompt);
    console.log("Vehicle context:", vehicleInfo ? "provided" : "not provided");
    console.log("Image data type:", typeof image);
    console.log("Image data starts with:", image.substring(0, 20) + "...");
    
    // Build the system prompt
    let systemPrompt = 'You are CarFix AI, an automotive part identification specialist with extensive knowledge of OEM and aftermarket parts. Analyze the provided image and identify the car part shown. Provide a detailed response that first explains the part in simple everyday terms with an analogy, then provides technical details.';
    
    // Add vehicle specificity instructions when vehicle info is provided
    if (vehicleInfo && Object.keys(vehicleInfo).length > 0) {
      systemPrompt += ` Your analysis should consider the context of a ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}. Identify the exact part with its OEM part number if possible.`;
      systemPrompt += ' Provide the following information in your response: 1) Part name and exact OEM part number, 2) Function and purpose of this part explained first in simple terms with an everyday analogy, 3) Common symptoms when this part fails, 4) Estimated replacement cost (OEM vs aftermarket), 5) Difficulty level for DIY replacement, 6) Where to purchase replacement parts, and 7) A brief description of where this component is located in the vehicle.';
    } else {
      systemPrompt += ' If a specific vehicle is mentioned in the user prompt, provide information relevant to that vehicle including the OEM part number if possible. Otherwise, provide general information about the part.';
      systemPrompt += ' Structure your response with these sections: 1) Part Identification (name and possible part numbers), 2) Function (with simple explanation first, then technical details), 3) Replacement Information, 4) Purchase Options, and 5) Location in the vehicle.';
    }
    
    // Add component diagram instructions
    systemPrompt += ' If you can identify a specific component with certainty, include a component diagram section using this format: {COMPONENT_DIAGRAM: {"componentName": "name of part", "location": "brief description of location"}}';
    
    // Process and validate the image data
    let imageUrl = image;
    let imageType = 'unknown';
    
    if (typeof image === 'string') {
      if (image.startsWith('data:image/')) {
        imageType = 'data-url';
      } else if (image.startsWith('http')) {
        imageType = 'remote-url';
      } else if (image.match(/^[A-Za-z0-9+/=]+$/)) {
        // Looks like a raw base64 string without the data: prefix
        imageType = 'raw-base64';
        imageUrl = `data:image/jpeg;base64,${image}`;
      }
    }
    
    console.log(`Image detected as type: ${imageType}, length: ${typeof image === 'string' ? image.length : 'unknown'}`);
    
    if (imageType === 'unknown') {
      return createErrorResponse(new Error("Unsupported image format"));
    }
    
    // Prepare the request to OpenAI
    try {
      // Create the request for the vision model
      const requestBody = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: { url: imageUrl } 
              }
            ]
          }
        ],
        temperature: 0.2, // Lower temperature for more deterministic, factual responses
      };
      
      console.log("Sending request to OpenAI vision API");
      
      // Call the OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        return createErrorResponse(new Error(`OpenAI API error: ${JSON.stringify(errorData)}`));
      }

      // Process the response
      const result = await response.json();
      console.log("OpenAI vision response received, length:", result.choices[0].message.content.length);
      
      return createSuccessResponse({
        analysis: result.choices[0].message.content,
        usage: result.usage
      });
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      return createErrorResponse(error);
    }
  } catch (error) {
    console.error("Unexpected error in image analysis handler:", error);
    return createErrorResponse(error);
  }
}
