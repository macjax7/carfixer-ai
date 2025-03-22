
import { corsHeaders, createSuccessResponse, createErrorResponse } from '../utils.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

export async function handleVehicleListing(data: any) {
  try {
    const { url } = data;
    
    if (!url) {
      throw new Error('No URL provided for vehicle listing analysis');
    }
    
    console.log('Analyzing vehicle listing:', url);
    
    // In a real implementation, we would scrape the listing page here
    // For the demo, we'll simulate extracting data using GPT-4o

    // First, simulate extracting basic data from the URL
    const extractedData = await extractListingData(url);
    
    if (!extractedData.success) {
      throw new Error('Failed to extract data from listing URL');
    }
    
    // Then, perform AI analysis on the extracted data
    const analysis = await analyzeVehicleListing(extractedData.data);
    
    return createSuccessResponse({
      ...extractedData.data,
      analysis,
      url
    });
  } catch (error) {
    console.error('Error in vehicle listing handler:', error);
    return createErrorResponse(error);
  }
}

async function extractListingData(url: string) {
  try {
    // Identify the platform from the URL
    const platform = identifyPlatform(url);
    
    // In a production environment, you would use a web scraper to extract data
    // For now, we'll use OpenAI to extract simulated data
    
    const promptText = `
Extract vehicle information from this listing URL: ${url}
Assume this is a ${platform} listing. Based on the URL structure and your knowledge of car listings, please create a plausible JSON representation of what data might be in this listing.
Include fields like: make, model, year, price, mileage, vin (if possible), and a short fictional description.
Also include an imageUrl field with a fictional URL to an image of this vehicle.
Just respond with the JSON, no explanations.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You extract structured data from car listing URLs. Respond with accurate JSON only.' },
          { role: 'user', content: promptText }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const textContent = result.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from OpenAI response');
    }
    
    const data = JSON.parse(jsonMatch[0]);
    console.log('Extracted data:', data);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error extracting listing data:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function analyzeVehicleListing(vehicleData: any) {
  try {
    const promptText = `
Analyze this vehicle listing:
- ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}
- Price: $${vehicleData.price}
- Mileage: ${vehicleData.mileage} miles
${vehicleData.vin ? `- VIN: ${vehicleData.vin}` : ''}
${vehicleData.description ? `- Description: "${vehicleData.description}"` : ''}

Provide a detailed analysis of:
1. Reliability: Common issues for this specific model year and reliability rating
2. Market Value: Is the price fair based on current market conditions? Explain why
3. Maintenance Needs: What maintenance would be expected at this mileage?
4. Red Flags: Any concerning issues to look out for with this specific vehicle
5. Recommendation: Should someone purchase this vehicle? Why or why not?

Return your response as a JSON object with these 5 keys, with concise but informative values for each.
Just respond with the JSON, no explanations.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert automotive analyst specializing in used car evaluations. Provide detailed, fact-based analyses of vehicle listings.' },
          { role: 'user', content: promptText }
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const result = await response.json();
    const textContent = result.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from OpenAI response');
    }
    
    const analysisData = JSON.parse(jsonMatch[0]);
    console.log('Analysis data:', analysisData);
    
    return analysisData;
  } catch (error) {
    console.error('Error analyzing vehicle listing:', error);
    return {
      reliability: "Sorry, couldn't analyze the reliability of this vehicle.",
      marketValue: "Unable to determine the market value at this time.",
      maintenanceNeeds: "Couldn't assess maintenance needs for this vehicle.",
      redFlags: "No specific red flags identified. Perform a standard inspection.",
      recommendation: "Consider getting a professional inspection before purchasing."
    };
  }
}

function identifyPlatform(url: string) {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('craigslist.org')) return 'Craigslist';
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.com')) return 'Facebook Marketplace';
  if (lowerUrl.includes('cargurus.com')) return 'CarGurus';
  if (lowerUrl.includes('edmunds.com')) return 'Edmunds';
  if (lowerUrl.includes('autotrader.com')) return 'AutoTrader';
  if (lowerUrl.includes('cars.com')) return 'Cars.com';
  if (lowerUrl.includes('truecar.com')) return 'TrueCar';
  if (lowerUrl.includes('carmax.com')) return 'CarMax';
  if (lowerUrl.includes('ebay.com')) return 'eBay Motors';
  
  return 'Unknown Platform';
}
