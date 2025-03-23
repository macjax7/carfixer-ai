import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  image?: string;
  lastService?: string;
  nickname?: string;
}

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  removeVehicle: (id: string) => void;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  selectVehicle: (id: string) => void;
}

export const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2018,
      vin: '4T1BF1FK5HU123456',
      image: '/placeholder.svg',
      lastService: '2023-09-15',
      nickname: 'Daily Driver'
    },
    {
      id: '2',
      make: 'Honda',
      model: 'CR-V',
      year: 2020,
      vin: '5J6RW2H85LA123456',
      image: '/placeholder.svg',
      lastService: '2023-11-03',
      nickname: 'Family SUV'
    }
  ]);
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0]);
  
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = {
      ...vehicle,
      id: Date.now().toString(),
    };
    setVehicles([...vehicles, newVehicle]);
  };
  
  const removeVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    if (selectedVehicle?.id === id) {
      setSelectedVehicle(vehicles.length > 1 ? vehicles.find(v => v.id !== id) || null : null);
    }
  };
  
  const updateVehicle = (id: string, updatedVehicle: Partial<Vehicle>) => {
    setVehicles(vehicles.map(vehicle => 
      vehicle.id === id ? { ...vehicle, ...updatedVehicle } : vehicle
    ));
    
    if (selectedVehicle?.id === id) {
      setSelectedVehicle(prev => prev ? { ...prev, ...updatedVehicle } : null);
    }
  };
  
  const selectVehicle = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id);
    setSelectedVehicle(vehicle || null);
  };
  
  return (
    <VehicleContext.Provider value={{
      vehicles,
      selectedVehicle,
      addVehicle,
      removeVehicle,
      updateVehicle,
      selectVehicle
    }}>
      {children}
    </VehicleContext.Provider>
  );
};
