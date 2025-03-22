
import { useContext } from 'react';
import { VehicleContext } from '@/context/VehicleContext';

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  
  if (!context) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  
  return context;
};
