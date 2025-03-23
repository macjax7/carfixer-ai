
import React, { useState } from 'react';
import { useDiagnostics } from '../context/DiagnosticContext';
import { useVehicles } from '../hooks/use-vehicles';
import { Search, AlertCircle } from 'lucide-react';

// Common OBD codes for demonstration
const commonCodes: Record<string, { description: string, severity: 'low' | 'medium' | 'high' }> = {
  'P0420': { description: 'Catalyst System Efficiency Below Threshold', severity: 'medium' },
  'P0300': { description: 'Random/Multiple Cylinder Misfire Detected', severity: 'high' },
  'P0171': { description: 'System Too Lean (Bank 1)', severity: 'medium' },
  'P0455': { description: 'Evaporative Emission System Leak Detected (large leak)', severity: 'low' },
  'P0401': { description: 'Exhaust Gas Recirculation Flow Insufficient', severity: 'medium' },
};

const DiagnosticCodeEntry: React.FC = () => {
  const [codeInput, setCodeInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { addCodeToCurrentSession, currentSession, addSession } = useDiagnostics();
  const { selectedVehicle } = useVehicles();
  
  const validateCode = (code: string): boolean => {
    // Basic OBD-II code format validation (P, B, C, or U followed by 4 digits)
    const regex = /^[PBCU][0-9]{4}$/;
    return regex.test(code.toUpperCase());
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedCode = codeInput.toUpperCase().replace(/\s/g, '');
    
    if (!formattedCode) {
      setError('Please enter a code');
      return;
    }
    
    if (!validateCode(formattedCode)) {
      setError('Invalid code format. Example: P0420');
      return;
    }
    
    setError(null);
    
    // For demo purposes, use our predefined codes or create a generic one
    const codeInfo = commonCodes[formattedCode] || {
      description: 'Unknown Code',
      severity: 'medium' as const
    };
    
    const newCode = {
      code: formattedCode,
      description: codeInfo.description,
      severity: codeInfo.severity,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Create a new session if none exists
    if (!currentSession && selectedVehicle) {
      addSession({
        vehicleId: selectedVehicle.id,
        codes: [newCode]
      });
    } else if (currentSession) {
      addCodeToCurrentSession(newCode);
    }
    
    setCodeInput('');
  };
  
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
      <h2 className="text-lg font-medium mb-3">Enter OBD-II Code</h2>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="e.g. P0420"
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-carfix-500 focus:border-carfix-500"
          />
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 text-alert text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-carfix-600 text-white py-2 rounded-lg hover:bg-carfix-700 transition-colors"
        >
          Add Code
        </button>
      </form>
      
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">
          Tip: Connect an OBD-II scanner for automatic code reading
        </p>
      </div>
    </div>
  );
};

export default DiagnosticCodeEntry;
