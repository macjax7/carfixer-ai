
import { useContext } from 'react';
import { VehicleContext } from '@/context/VehicleContext';
import { VehicleContextType } from '@/types/vehicle';

// Default empty vehicle implementation for when no provider is present
const defaultVehicleContext: VehicleContextType = {
  vehicles: [],
  selectedVehicle: null,
  addVehicle: async () => {},
  removeVehicle: async () => {},
  updateVehicle: async () => {},
  selectVehicle: () => {},
  loading: false,
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  
  // Return the default context if we're not within a provider
  // This prevents crashes but will not provide real data
  if (!context) {
    console.warn('useVehicles was called outside of VehicleProvider. Using mock implementation.');
    return defaultVehicleContext;
  }
  
  return context;
};
