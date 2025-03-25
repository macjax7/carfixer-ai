
/**
 * Utilities for generating natural language prompts
 */

/**
 * Generate a prompt asking for vehicle information
 */
export function generateVehiclePrompt(): string {
  const prompts = [
    "Which vehicle are you working on? I can provide more specific advice if you share the year, make, and model.",
    "I'd like to help with that. What's the year, make, and model of your vehicle so I can give you the most accurate information?",
    "To give you the best guidance, could you tell me which vehicle you're asking about? The year, make, and model would be helpful.",
    "For me to provide specific instructions, I'll need to know what vehicle you're working with. Can you share the year, make, and model?",
    "Different vehicles have different procedures. What's the year, make, and model of the vehicle you're working on?"
  ];
  
  return prompts[Math.floor(Math.random() * prompts.length)];
}
