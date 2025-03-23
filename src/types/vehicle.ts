
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
  // Additional properties from database
  user_id?: string;
  mileage?: number;
  color?: string;
  license_plate?: string;
  // Aliases for compatibility
  image?: string;
  lastService?: string;
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
