
import React, { useState } from 'react';
import { useVehicles, Vehicle } from '../context/VehicleContext';
import VehicleCard from './VehicleCard';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VehicleManager: React.FC = () => {
  const { vehicles, selectVehicle } = useVehicles();
  const navigate = useNavigate();
  
  const handleSelectVehicle = (id: string) => {
    selectVehicle(id);
    navigate('/');
  };
  
  const handleAddVehicle = () => {
    // In a real app, this would navigate to a form
    console.log('Add vehicle clicked');
  };
  
  const handleEditVehicle = (id: string) => {
    // In a real app, this would navigate to an edit form
    console.log('Edit vehicle clicked', id);
  };
  
  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Vehicles</h2>
        <button
          onClick={handleAddVehicle}
          className="p-2 rounded-full bg-carfix-50 text-carfix-600 hover:bg-carfix-100 transition-colors"
          aria-label="Add vehicle"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
      
      <div className="grid gap-4 grid-cols-1">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onSelect={() => handleSelectVehicle(vehicle.id)}
            onEdit={() => handleEditVehicle(vehicle.id)}
          />
        ))}
        
        {vehicles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No vehicles added yet</p>
            <button
              onClick={handleAddVehicle}
              className="mt-4 px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
            >
              Add Your First Vehicle
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleManager;
