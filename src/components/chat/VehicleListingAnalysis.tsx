
import React from 'react';
import { CheckCircle, Car, AlertTriangle, DollarSign, Wrench, Star } from 'lucide-react';

interface VehicleListingAnalysisProps {
  vehicleListingAnalysis: {
    url: string;
    make?: string;
    model?: string;
    year?: number;
    mileage?: number;
    price?: number;
    vin?: string;
    description?: string;
    imageUrl?: string;
    analysis: {
      reliability: string;
      marketValue: string;
      maintenanceNeeds: string;
      redFlags: string;
      recommendation: string;
    };
  };
}

const VehicleListingAnalysis: React.FC<VehicleListingAnalysisProps> = ({ 
  vehicleListingAnalysis 
}) => {
  return (
    <div className="mt-4 border border-border/60 rounded-lg overflow-hidden">
      <div className="bg-background/80 p-3 border-b border-border/60">
        <div className="flex items-center gap-2 mb-1 text-carfix-600">
          <Car className="h-4 w-4" />
          <h4 className="font-medium">Vehicle Listing Analysis</h4>
        </div>
        
        {vehicleListingAnalysis.imageUrl && (
          <div className="mt-2 rounded-md overflow-hidden border border-border/60">
            <img 
              src={vehicleListingAnalysis.imageUrl} 
              alt="Vehicle Listing" 
              className="w-full object-cover h-40"
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-sm">
          {vehicleListingAnalysis.make && vehicleListingAnalysis.model && vehicleListingAnalysis.year && (
            <div className="col-span-2">
              <span className="font-semibold">{vehicleListingAnalysis.year} {vehicleListingAnalysis.make} {vehicleListingAnalysis.model}</span>
            </div>
          )}
          {vehicleListingAnalysis.price && (
            <div>
              <span className="text-muted-foreground">Price:</span> ${vehicleListingAnalysis.price.toLocaleString()}
            </div>
          )}
          {vehicleListingAnalysis.mileage && (
            <div>
              <span className="text-muted-foreground">Mileage:</span> {vehicleListingAnalysis.mileage.toLocaleString()} miles
            </div>
          )}
          {vehicleListingAnalysis.vin && (
            <div className="col-span-2">
              <span className="text-muted-foreground">VIN:</span> {vehicleListingAnalysis.vin}
            </div>
          )}
        </div>
        
        {vehicleListingAnalysis.description && (
          <div className="mt-2">
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Seller Description
              </summary>
              <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                {vehicleListingAnalysis.description.length > 300 
                  ? vehicleListingAnalysis.description.substring(0, 300) + '...' 
                  : vehicleListingAnalysis.description}
              </p>
            </details>
          </div>
        )}
        
        <div className="mt-2 text-xs">
          <a 
            href={vehicleListingAnalysis.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-carfix-500 hover:underline"
          >
            View Original Listing
          </a>
        </div>
      </div>
      
      <div className="p-3">
        <h5 className="font-medium mb-2 flex items-center gap-1.5">
          <Star className="h-4 w-4 text-carfix-500" />
          <span>AI Analysis</span>
        </h5>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
            <div>
              <strong className="block text-green-700 dark:text-green-400">Reliability</strong>
              <p className="text-muted-foreground">{vehicleListingAnalysis.analysis.reliability}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-blue-500 mt-0.5" />
            <div>
              <strong className="block text-blue-700 dark:text-blue-400">Market Value</strong>
              <p className="text-muted-foreground">{vehicleListingAnalysis.analysis.marketValue}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Wrench className="h-4 w-4 text-amber-500 mt-0.5" />
            <div>
              <strong className="block text-amber-700 dark:text-amber-400">Maintenance Needs</strong>
              <p className="text-muted-foreground">{vehicleListingAnalysis.analysis.maintenanceNeeds}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <div>
              <strong className="block text-red-700 dark:text-red-400">Red Flags</strong>
              <p className="text-muted-foreground">{vehicleListingAnalysis.analysis.redFlags}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-2 border-t border-border/60">
            <strong className="block mb-1">Recommendation</strong>
            <p>{vehicleListingAnalysis.analysis.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleListingAnalysis;
