
import React from 'react';
import { DiagnosticCode } from '../context/DiagnosticContext';
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react';

interface DiagnosticResultProps {
  code: DiagnosticCode;
  onViewDetails?: () => void;
}

const DiagnosticResult: React.FC<DiagnosticResultProps> = ({ code, onViewDetails }) => {
  const getSeverityIcon = () => {
    switch (code.severity) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-alert" />;
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const getSeverityText = () => {
    switch (code.severity) {
      case 'high':
        return 'Urgent attention required';
      case 'medium':
        return 'Service recommended soon';
      case 'low':
        return 'Monitor and check at next service';
      default:
        return 'Unknown severity';
    }
  };
  
  return (
    <div className="diagnostic-card">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="pt-1">
            {getSeverityIcon()}
          </div>
          
          <div>
            <span className="obd-code">{code.code}</span>
            <h3 className="text-base font-medium mt-1.5">{code.description}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getSeverityText()}
            </p>
            
            <div className="mt-2 text-xs text-muted-foreground">
              Detected on {code.date}
            </div>
          </div>
        </div>
        
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="p-2 rounded-full text-carfix-600 hover:bg-carfix-50 transition-colors"
            aria-label="View details"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default DiagnosticResult;
