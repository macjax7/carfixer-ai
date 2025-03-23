
import React, { useState, useEffect, useCallback } from 'react';
import { VehicleContext } from '@/context/VehicleContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Vehicle } from '@/types/vehicle';
import { nanoid } from 'nanoid';

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Fetch user's vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) {
        setVehicles([]);
        setIsLoading(false);
        return;
      }

      try {
        // Using 'from' with type assertion to tell TypeScript this is safe
        // This works around the database type definition limitations
        const { data, error } = await (supabase
          .from('vehicles' as any)
          .select('*')
          .eq('user_id', user.id));

        if (error) {
          console.error('Error fetching vehicles:', error);
          setVehicles([]);
        } else if (data) {
          // Type assertion to help TypeScript understand this is a Vehicle array
          setVehicles(data as unknown as Vehicle[]);
        }
      } catch (err) {
        console.error('Exception fetching vehicles:', err);
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [user]);

  // Add a vehicle
  const addVehicle = useCallback(async (vehicleData: Omit<Vehicle, 'id' | 'user_id'>) => {
    if (!user) return null;

    const newVehicle: Vehicle = {
      id: nanoid(),
      user_id: user.id,
      ...vehicleData,
    };

    try {
      // Using type assertion to work around database type limitations
      const { error } = await (supabase
        .from('vehicles' as any)
        .insert([{
          id: newVehicle.id,
          user_id: newVehicle.user_id,
          make: newVehicle.make,
          model: newVehicle.model,
          year: newVehicle.year,
          mileage: newVehicle.mileage,
          color: newVehicle.color,
          vin: newVehicle.vin,
          license_plate: newVehicle.license_plate,
          nickname: newVehicle.nickname,
        }]));

      if (error) {
        console.error('Error adding vehicle:', error);
        return null;
      }

      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      console.error('Exception adding vehicle:', err);
      return null;
    }
  }, [user]);

  // Update a vehicle
  const updateVehicle = useCallback(async (updatedVehicle: Vehicle) => {
    if (!user) return false;

    try {
      // Using type assertion to work around database type limitations
      const { error } = await (supabase
        .from('vehicles' as any)
        .update({
          make: updatedVehicle.make,
          model: updatedVehicle.model,
          year: updatedVehicle.year,
          mileage: updatedVehicle.mileage,
          color: updatedVehicle.color,
          vin: updatedVehicle.vin,
          license_plate: updatedVehicle.license_plate,
          nickname: updatedVehicle.nickname,
        })
        .eq('id', updatedVehicle.id)
        .eq('user_id', user.id));

      if (error) {
        console.error('Error updating vehicle:', error);
        return false;
      }

      setVehicles(prev => 
        prev.map(vehicle => 
          vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
        )
      );

      if (selectedVehicle?.id === updatedVehicle.id) {
        setSelectedVehicle(updatedVehicle);
      }

      return true;
    } catch (err) {
      console.error('Exception updating vehicle:', err);
      return false;
    }
  }, [user, selectedVehicle]);

  // Delete a vehicle
  const deleteVehicle = useCallback(async (vehicleId: string) => {
    if (!user) return false;

    try {
      // Using type assertion to work around database type limitations
      const { error } = await (supabase
        .from('vehicles' as any)
        .delete()
        .eq('id', vehicleId)
        .eq('user_id', user.id));

      if (error) {
        console.error('Error deleting vehicle:', error);
        return false;
      }

      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
      
      if (selectedVehicle?.id === vehicleId) {
        setSelectedVehicle(null);
      }

      return true;
    } catch (err) {
      console.error('Exception deleting vehicle:', err);
      return false;
    }
  }, [user, selectedVehicle]);

  // Select a vehicle
  const selectVehicle = useCallback((vehicle: Vehicle | null) => {
    setSelectedVehicle(vehicle);
  }, []);

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        selectedVehicle,
        isLoading,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        selectVehicle,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export default VehicleProvider;
