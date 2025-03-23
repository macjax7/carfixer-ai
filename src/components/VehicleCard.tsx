
import React from 'react';
import { Vehicle } from '../context/VehicleContext';
import { ArrowRight, Settings } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onSelect: () => void;
  onEdit?: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onSelect, onEdit }) => {
  // Use image_url with fallback to image for compatibility
  const imageUrl = vehicle.image_url || vehicle.image || '/placeholder.svg';
  // Use last_service with fallback to lastService for compatibility
  const serviceDate = vehicle.last_service || vehicle.lastService || 'Not recorded';
  
  return (
    <div className="vehicle-card animate-scale">
      <div className="relative h-36 bg-gradient-to-b from-carfix-700 to-carfix-900">
        <img 
          src={imageUrl} 
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-lg font-medium">
            {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          </h3>
          <p className="text-sm opacity-80">
            {!vehicle.nickname && `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            {vehicle.nickname && `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          </p>
        </div>
        
        {onEdit && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            aria-label="Edit vehicle"
          >
            <Settings className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
      
      <div className="p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground">
            Last service: {serviceDate}
          </p>
          {vehicle.vin && (
            <p className="text-xs text-muted-foreground mt-1">
              VIN: {vehicle.vin.slice(-4).padStart(vehicle.vin.length, '•')}
            </p>
          )}
        </div>
        
        <button
          onClick={onSelect}
          className="p-2 rounded-full text-carfix-600 hover:bg-carfix-50 transition-colors"
          aria-label="Select vehicle"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
