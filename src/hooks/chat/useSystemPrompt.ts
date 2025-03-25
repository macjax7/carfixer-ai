
import { useMemo } from 'react';
import { useVehicleContext } from './useVehicleContext';

export const useSystemPrompt = () => {
  const { vehicleContext } = useVehicleContext();
  
  const systemPrompt = useMemo(() => {
    // Create vehicle description or placeholder if no vehicle is selected
    const vehicleDescription = vehicleContext 
      ? `${vehicleContext.year} ${vehicleContext.make} ${vehicleContext.model}`
      : "[No vehicle selected]";
    
    return `
You are CarFix AI, a certified vehicle repair assistant.

Always give **accurate and specific advice** for the selected vehicle.
Include:
- Step-by-step repair instructions
- Tools needed
- Torque specs
- Fluid types (OEM recommended)
- Common part numbers or names
- Safety precautions

When answering, assume the vehicle is: ${vehicleDescription}

NEVER give generic advice. If you don't have enough vehicle context, ask for it first.
`;
  }, [vehicleContext]);

  return { systemPrompt };
};
