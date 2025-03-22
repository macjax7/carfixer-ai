
import React from 'react';
import Header from '../components/Header';
import DiagnosticResult from '../components/DiagnosticResult';
import { useVehicles } from '../context/VehicleContext';
import { useDiagnostics } from '../context/DiagnosticContext';
import { Wrench, Car, ScanLine, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index: React.FC = () => {
  const { selectedVehicle } = useVehicles();
  const { sessions } = useDiagnostics();
  const navigate = useNavigate();
  
  // Get the latest session for the selected vehicle
  const latestSession = selectedVehicle 
    ? sessions
        .filter(session => session.vehicleId === selectedVehicle.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  
  return (
    <div className="min-h-screen bg-background">
      <Header title="CarFix" />
      
      <main className="container max-w-md mx-auto px-4 py-6">
        {selectedVehicle ? (
          <div className="animate-fade-in">
            <div className="glass-card rounded-xl overflow-hidden mb-6">
              <div className="relative h-48 bg-gradient-to-b from-carfix-700 to-carfix-900">
                <img 
                  src={selectedVehicle.image || '/placeholder.svg'} 
                  alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h1 className="text-xl font-medium mb-1">
                    {selectedVehicle.nickname || `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                  </h1>
                  <p className="text-sm opacity-90">
                    {selectedVehicle.nickname && `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                  </p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/chat')}
                    className="flex flex-col items-center justify-center p-3 bg-carfix-50 rounded-lg hover:bg-carfix-100 transition-colors"
                  >
                    <Wrench className="h-6 w-6 text-carfix-600 mb-2" />
                    <span className="text-sm">Fix</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/scan')}
                    className="flex flex-col items-center justify-center p-3 bg-carfix-50 rounded-lg hover:bg-carfix-100 transition-colors"
                  >
                    <ScanLine className="h-6 w-6 text-carfix-600 mb-2" />
                    <span className="text-sm">Scan</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/vehicles')}
                    className="flex flex-col items-center justify-center p-3 bg-carfix-50 rounded-lg hover:bg-carfix-100 transition-colors"
                  >
                    <Car className="h-6 w-6 text-carfix-600 mb-2" />
                    <span className="text-sm">Vehicles</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium">Current Diagnostics</h2>
                {latestSession && (
                  <span className="text-sm text-muted-foreground">
                    {latestSession.date}
                  </span>
                )}
              </div>
              
              {latestSession && latestSession.codes.length > 0 ? (
                <div className="space-y-3">
                  {latestSession.codes.map((code) => (
                    <DiagnosticResult
                      key={code.code}
                      code={code}
                      onViewDetails={() => navigate('/chat')}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/20 rounded-xl">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-full bg-muted/30">
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-base font-medium mb-1">No Issues Detected</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Scan for diagnostic codes or chat with AI assistant
                  </p>
                  <button
                    onClick={() => navigate('/scan')}
                    className="px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
                  >
                    Start Scan
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-muted/30">
                <Car className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-xl font-medium mb-2">No Vehicle Selected</h2>
            <p className="text-muted-foreground mb-6">
              Add a vehicle to get started with diagnostics
            </p>
            <button
              onClick={() => navigate('/vehicles')}
              className="px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
            >
              Manage Vehicles
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
