
import React from 'react';
import Header from '../components/Header';
import VehicleManager from '../components/VehicleManager';

const Vehicles: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Your Vehicles" showBackButton={true} />
      
      <main className="container max-w-md mx-auto px-4 py-6">
        <VehicleManager />
      </main>
    </div>
  );
};

export default Vehicles;
