import { useState, useCallback } from 'react';
import { useVehicles } from '@/hooks/use-vehicles';
import { useVehicleExtractor } from './useVehicleExtractor';
import { Message } from '@/components/chat/types';

export const useVehicleContext = () => {
  const { selectedVehicle } = useVehicles();
  const [vehicleContext, setVehicleContext] = useState<any>(selectedVehicle || null);
  const { extractVehicleInfo } = useVehicleExtractor();

  /**
   * Extract vehicle information from a message and update context
   */
  const updateVehicleContext = useCallback((text: string) => {
    const newVehicleInfo = extractVehicleInfo(text, selectedVehicle);
    if (newVehicleInfo) {
      console.log("Extracted new vehicle info:", newVehicleInfo);
      setVehicleContext(newVehicleInfo);
      return newVehicleInfo;
    }
    return null;
  }, [extractVehicleInfo, selectedVehicle]);

  /**
   * Get current vehicle context from messages if not already available
   */
  const getVehicleContextFromMessages = useCallback((messages: Message[]) => {
    // First check if we already have a vehicle context
    if (vehicleContext) {
      console.log("Using existing vehicle context:", vehicleContext);
      return vehicleContext;
    }
    
    // Then check if the user has a selected vehicle
    if (selectedVehicle) {
      console.log("Using selected vehicle as context:", selectedVehicle);
      setVehicleContext(selectedVehicle);
      return selectedVehicle;
    }
    
    // Otherwise scan through messages to find vehicle mentions
    console.log("Scanning message history for vehicle context...");
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.sender === 'user') {
        const extractedInfo = extractVehicleInfo(message.text);
        if (extractedInfo) {
          console.log("Found vehicle context in message history:", extractedInfo);
          setVehicleContext(extractedInfo);
          return extractedInfo;
        }
      }
    }
    
    console.log("No vehicle context found in message history");
    return null;
  }, [messages, extractVehicleInfo, selectedVehicle, vehicleContext]);

  return {
    vehicleContext,
    setVehicleContext,
    updateVehicleContext,
    getVehicleContextFromMessages
  };
};
