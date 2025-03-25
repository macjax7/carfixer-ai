
import { useState, useCallback, useRef, useEffect } from 'react';
import { useVehicles } from '@/hooks/use-vehicles';
import { useVehicleExtractor } from './useVehicleExtractor';
import { Message } from '@/components/chat/types';

export const useVehicleContext = () => {
  const { selectedVehicle } = useVehicles();
  const [vehicleContext, setVehicleContext] = useState<any>(selectedVehicle || null);
  const { extractVehicleInfo } = useVehicleExtractor();
  
  // Use a ref to track if we've locked to a specific vehicle
  const vehicleLocked = useRef<boolean>(false);

  // Synchronize with selectedVehicle when it changes (if not locked)
  useEffect(() => {
    if (selectedVehicle && !vehicleLocked.current) {
      console.log("Updating vehicle context from selected vehicle:", selectedVehicle);
      setVehicleContext(selectedVehicle);
    }
  }, [selectedVehicle]);

  /**
   * Extract vehicle information from a message and update context
   */
  const updateVehicleContext = useCallback((text: string) => {
    // Don't try to extract if we've already locked to a vehicle and have context
    if (vehicleLocked.current && vehicleContext) {
      console.log("Vehicle is locked, not updating context from message");
      return vehicleContext;
    }
    
    const newVehicleInfo = extractVehicleInfo(text, selectedVehicle);
    if (newVehicleInfo) {
      console.log("Extracted new vehicle info:", newVehicleInfo);
      setVehicleContext(newVehicleInfo);
      vehicleLocked.current = true; // Lock to this vehicle
      return newVehicleInfo;
    }
    return vehicleContext; // Return existing context if no new info extracted
  }, [extractVehicleInfo, selectedVehicle, vehicleContext]);

  /**
   * Get current vehicle context from messages if not already available
   */
  const getVehicleContextFromMessages = useCallback((messagesArray: Message[]) => {
    // First check if we already have a vehicle context
    if (vehicleContext) {
      console.log("Using existing vehicle context:", vehicleContext);
      return vehicleContext;
    }
    
    // Then check if the user has a selected vehicle
    if (selectedVehicle) {
      console.log("Using selected vehicle as context:", selectedVehicle);
      setVehicleContext(selectedVehicle);
      vehicleLocked.current = true; // Lock to selected vehicle
      return selectedVehicle;
    }
    
    // Otherwise scan through messages to find vehicle mentions
    console.log("Scanning message history for vehicle context...");
    for (let i = messagesArray.length - 1; i >= 0; i--) {
      const message = messagesArray[i];
      if (message.sender === 'user') {
        const extractedInfo = extractVehicleInfo(message.text);
        if (extractedInfo) {
          console.log("Found vehicle context in message history:", extractedInfo);
          setVehicleContext(extractedInfo);
          vehicleLocked.current = true; // Lock to this vehicle
          return extractedInfo;
        }
      }
    }
    
    console.log("No vehicle context found in message history");
    return null;
  }, [extractVehicleInfo, selectedVehicle, vehicleContext]);

  /**
   * Explicitly set the vehicle context and lock it
   */
  const setAndLockVehicleContext = useCallback((vehicle: any) => {
    console.log("Explicitly setting and locking vehicle context:", vehicle);
    setVehicleContext(vehicle);
    vehicleLocked.current = true;
  }, []);

  /**
   * Reset the vehicle context lock
   */
  const resetVehicleContextLock = useCallback(() => {
    console.log("Resetting vehicle context lock");
    vehicleLocked.current = false;
    // If we have a selected vehicle, use that
    if (selectedVehicle) {
      setVehicleContext(selectedVehicle);
    } else {
      setVehicleContext(null);
    }
  }, [selectedVehicle]);

  /**
   * Check if the vehicle context is currently locked
   */
  const isVehicleLocked = useCallback(() => {
    return vehicleLocked.current;
  }, []);

  return {
    vehicleContext,
    setVehicleContext,
    updateVehicleContext,
    getVehicleContextFromMessages,
    setAndLockVehicleContext,
    resetVehicleContextLock,
    isVehicleLocked
  };
};
