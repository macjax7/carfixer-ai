
import React from 'react';
import Header from '../components/Header';
import VehicleManager from '../components/VehicleManager';

const Vehicles: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Vehicles</h1>
        <VehicleManager />
      </main>
    </div>
  );
};

export default Vehicles;
