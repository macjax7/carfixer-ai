
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VehicleContext } from '@/context/VehicleContext';
import { Vehicle, VehicleContextType } from '@/types/vehicle';
import { useAuth } from '@/context/AuthContext';
import { nanoid } from 'nanoid';

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch vehicles when user changes
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
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setVehicles(data || []);
        
        // Select the first vehicle if available and none is selected
        if (data && data.length > 0 && !selectedVehicle) {
          setSelectedVehicle(data[0]);
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();

    // Set up real-time subscription for vehicles
    let subscription: any = null;
    
    if (user) {
      subscription = supabase
        .channel('vehicles-changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'vehicles',
            filter: `user_id=eq.${user.id}`
          }, 
          () => {
            fetchVehicles();
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user]);

  // Add a new vehicle
  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id'>) => {
    if (!user) return;

    const newVehicle = {
      ...vehicle,
      id: nanoid(),
      user_id: user.id,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('vehicles')
        .insert([newVehicle]);

      if (error) throw error;
      
      // We don't need to update state manually since the real-time subscription will do it
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  }, [user]);

  // Remove a vehicle
  const removeVehicle = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // If the deleted vehicle was selected, select another one
      if (selectedVehicle?.id === id) {
        const remainingVehicles = vehicles.filter(v => v.id !== id);
        setSelectedVehicle(remainingVehicles.length > 0 ? remainingVehicles[0] : null);
      }
      
      // We don't need to update vehicles state manually since the real-time subscription will do it
    } catch (error) {
      console.error('Error removing vehicle:', error);
    }
  }, [selectedVehicle, vehicles]);

  // Update a vehicle
  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      // Update the selected vehicle if it's the one being updated
      if (selectedVehicle?.id === id) {
        setSelectedVehicle(prev => prev ? { ...prev, ...updates } : null);
      }
      
      // We don't need to update vehicles state manually since the real-time subscription will do it
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  }, [selectedVehicle]);

  // Select a vehicle
  const selectVehicle = useCallback((id: string) => {
    const vehicle = vehicles.find(v => v.id === id) || null;
    setSelectedVehicle(vehicle);
  }, [vehicles]);

  // Create the context value object
  const contextValue: VehicleContextType = {
    vehicles,
    selectedVehicle,
    addVehicle,
    removeVehicle,
    updateVehicle,
    selectVehicle,
    loading
  };

  return (
    <VehicleContext.Provider value={contextValue}>
      {children}
    </VehicleContext.Provider>
  );
};
