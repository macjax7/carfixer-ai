
import React, { useState, ReactNode, useEffect } from 'react';
import { VehicleContext } from '@/context/VehicleContext';
import { Vehicle } from '@/types/vehicle';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchVehicles, 
  addVehicleToSupabase, 
  removeVehicleFromSupabase, 
  updateVehicleInSupabase,
  subscribeToVehicleChanges
} from '@/services/vehicleService';

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
    const loadVehicles = async () => {
      if (!user) {
        setVehicles([]);
        setSelectedVehicle(null);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const formattedVehicles = await fetchVehicles(user.id);
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
    
    loadVehicles();
    
    // Setup subscription for real-time updates
    const subscription = subscribeToVehicleChanges(user?.id, loadVehicles);
      
    return () => {
      supabase.removeChannel(subscription);
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
      await addVehicleToSupabase(user, vehicle);
      
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
      await removeVehicleFromSupabase(user.id, id);
      
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
      await updateVehicleInSupabase(user.id, id, updatedVehicle);
      
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
