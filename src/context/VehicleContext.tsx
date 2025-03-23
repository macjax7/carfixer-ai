
import { createContext } from 'react';
import { VehicleContextType } from '@/types/vehicle';

// Create context with default empty implementation
export const VehicleContext = createContext<VehicleContextType | null>(null);
