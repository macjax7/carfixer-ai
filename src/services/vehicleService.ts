
import { supabase } from '@/integrations/supabase/client';
import { Vehicle } from '@/types/vehicle';
import { UserWithCustomAttributes } from '@/integrations/supabase/client';

// Fetch vehicles from Supabase
export const fetchVehicles = async (userId: string) => {
  try {
    // Use type assertions for now
    const { data: vehiclesData, error } = await supabase
      .from('vehicles' as any)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (!vehiclesData) {
      return [];
    }
    
    // Convert the Supabase vehicle data to our Vehicle interface
    return vehiclesData.map((vehicle: any) => ({
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
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    throw error;
  }
};

// Add a vehicle to Supabase
export const addVehicleToSupabase = async (
  user: UserWithCustomAttributes,
  vehicle: Omit<Vehicle, 'id'>
) => {
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
  
  return data;
};

// Remove a vehicle from Supabase
export const removeVehicleFromSupabase = async (
  userId: string,
  vehicleId: string
) => {
  const { error } = await supabase
    .from('vehicles' as any)
    .delete()
    .eq('id', vehicleId)
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
};

// Update a vehicle in Supabase
export const updateVehicleInSupabase = async (
  userId: string,
  vehicleId: string,
  updatedVehicle: Partial<Vehicle>
) => {
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
    .eq('id', vehicleId)
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
};

// Setup real-time subscription for vehicle changes
export const subscribeToVehicleChanges = (userId: string | undefined, onUpdate: () => void) => {
  if (!userId) return { unsubscribe: () => {} };
  
  return supabase
    .channel('vehicles-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'vehicles',
        filter: userId ? `user_id=eq.${userId}` : undefined
      } as any, 
      () => {
        onUpdate();
      }
    )
    .subscribe();
};
