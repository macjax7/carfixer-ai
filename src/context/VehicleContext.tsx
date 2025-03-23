
import { createContext } from 'react';
import { VehicleContextType } from '@/types/vehicle';

// Create context with default empty implementation
export const VehicleContext = createContext<VehicleContextType | null>(null);

// Re-export the useVehicles hook for backward compatibility
export { useVehicles } from '@/hooks/use-vehicles';
// Re-export the Vehicle type for backward compatibility
export type { Vehicle } from '@/types/vehicle';
