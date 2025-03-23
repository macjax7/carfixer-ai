
// Vehicle type definitions
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  image_url?: string;
  last_service?: string;
  nickname?: string;
  image?: string; // Alias for compatibility
  lastService?: string; // Alias for compatibility
}

export interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  selectVehicle: (id: string) => void;
  loading: boolean;
}
