
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';

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

interface VehicleContextType {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<void>;
  removeVehicle: (id: string) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  selectVehicle: (id: string) => void;
  loading: boolean;
}

export const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};

interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch vehicles from Supabase when user changes
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) {
        setVehicles([]);
        setSelectedVehicle(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Use type assertions for now
        const { data: vehiclesData, error } = await supabase
          .from('vehicles' as any)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (!vehiclesData) {
          setVehicles([]);
          setLoading(false);
          return;
        }
        
        // Convert the Supabase vehicle data to our Vehicle interface
        const formattedVehicles: Vehicle[] = vehiclesData.map((vehicle: any) => ({
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          vin: vehicle.vin,
          image_url: vehicle.image_url,
          last_service: vehicle.last_service ? new Date(vehicle.last_service).toISOString().split('T')[0] : undefined,
          nickname: vehicle.nickname,
          // Add compatibility aliases
          image: vehicle.image_url,
          lastService: vehicle.last_service ? new Date(vehicle.last_service).toISOString().split('T')[0] : undefined
        }));
        
        setVehicles(formattedVehicles);
        
        // Set the first vehicle as selected if there is one and no current selection
        if (formattedVehicles.length > 0 && !selectedVehicle) {
          setSelectedVehicle(formattedVehicles[0]);
        } else if (selectedVehicle) {
          // Update selected vehicle if it exists in the new list
          const updatedSelected = formattedVehicles.find(v => v.id === selectedVehicle.id);
          setSelectedVehicle(updatedSelected || (formattedVehicles.length > 0 ? formattedVehicles[0] : null));
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast({
          title: "Error",
          description: "Failed to load your vehicles. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
    
    // Setup subscription for real-time updates
    const vehiclesSubscription = supabase
      .channel('vehicles-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vehicles',
          filter: user ? `user_id=eq.${user.id}` : undefined
        } as any, 
        () => {
          fetchVehicles();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(vehiclesSubscription);
    };
  }, [user, toast, selectedVehicle]);
  
  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add a vehicle",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Use type assertion for now
      const { data, error } = await supabase
        .from('vehicles' as any)
        .insert([{
          user_id: user.id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          vin: vehicle.vin,
          image_url: vehicle.image_url || vehicle.image, // Support both property names
          last_service: vehicle.last_service || vehicle.lastService,
          nickname: vehicle.nickname
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Vehicle Added",
        description: `${vehicle.make} ${vehicle.model} has been added to your vehicles`
      });
      
      // Local state update handled by the subscription
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to add vehicle. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const removeVehicle = async (id: string) => {
    if (!user) return;
    
    try {
      // Use type assertion for now
      const { error } = await supabase
        .from('vehicles' as any)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Vehicle Removed",
        description: "Vehicle has been removed from your account"
      });
      
      // Local state update handled by the subscription
    } catch (error) {
      console.error('Error removing vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to remove vehicle. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const updateVehicle = async (id: string, updatedVehicle: Partial<Vehicle>) => {
    if (!user) return;
    
    try {
      // Use type assertion for now
      const { error } = await supabase
        .from('vehicles' as any)
        .update({
          make: updatedVehicle.make,
          model: updatedVehicle.model,
          year: updatedVehicle.year,
          vin: updatedVehicle.vin,
          image_url: updatedVehicle.image_url || updatedVehicle.image,
          last_service: updatedVehicle.last_service || updatedVehicle.lastService,
          nickname: updatedVehicle.nickname
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Vehicle Updated",
        description: "Vehicle information has been updated"
      });
      
      // Local state update handled by the subscription
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle. Please try again.",
        variant: "destructive"
      });
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
      selectVehicle,
      loading
    }}>
      {children}
    </VehicleContext.Provider>
  );
};
