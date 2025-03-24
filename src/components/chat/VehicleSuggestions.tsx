
import React, { useCallback } from 'react';
import { useVehicles } from '@/hooks/use-vehicles';
import { useChat } from '@/hooks/chat/useChat';

interface VehicleSuggestionsProps {
  setUserScrolled: (scrolled: boolean) => void;
}

const VehicleSuggestions: React.FC<VehicleSuggestionsProps> = ({ setUserScrolled }) => {
  const { vehicles } = useVehicles();
  const { setInput, handleSendMessage } = useChat();
  
  // Handle setting input while respecting scroll state
  const handleVehicleSelect = useCallback((vehicleText: string) => {
    setInput(vehicleText);
    setUserScrolled(false); // Reset scroll state when selecting vehicle
    
    // Create a synthetic event to pass to handleSendMessage
    const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
    
    // Use a longer delay to ensure state updates properly before sending
    setTimeout(() => {
      handleSendMessage(syntheticEvent);
    }, 150);
  }, [setInput, setUserScrolled, handleSendMessage]);
  
  if (vehicles.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-4 max-w-3xl mx-auto">
      {vehicles.map(vehicle => (
        <button
          key={vehicle.id}
          className="bg-carfix-100 hover:bg-carfix-200 text-carfix-900 px-3 py-1.5 rounded-full text-sm transition-colors"
          onClick={() => handleVehicleSelect(`I'm working on my ${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.nickname ? ` (${vehicle.nickname})` : ''}`)}
        >
          {vehicle.year} {vehicle.make} {vehicle.model}
          {vehicle.nickname ? ` (${vehicle.nickname})` : ''}
        </button>
      ))}
      <button
        className="bg-secondary hover:bg-secondary/80 text-foreground px-3 py-1.5 rounded-full text-sm transition-colors"
        onClick={() => handleVehicleSelect("I'm working on a different vehicle")}
      >
        Different vehicle
      </button>
    </div>
  );
};

export default React.memo(VehicleSuggestions);
