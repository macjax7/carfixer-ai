
import React from 'react';
import { CheckCircle, Car, AlertTriangle, DollarSign, Wrench, Star, ExternalLink } from 'lucide-react';

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
  // Format price with commas and dollar sign
  const formatPrice = (price?: number) => {
    if (!price) return 'Not specified';
    return `$${price.toLocaleString()}`;
  };

  // Format mileage with commas
  const formatMileage = (mileage?: number) => {
    if (!mileage) return 'Not specified';
    return `${mileage.toLocaleString()} miles`;
  };

  // Format URL for display (truncate if too long)
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const host = urlObj.hostname.replace('www.', '');
      return host.length > 25 ? host.substring(0, 25) + '...' : host;
    } catch (e) {
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  // Determine if we have enough vehicle info to show the full header
  const hasVehicleInfo = vehicleListingAnalysis.make && 
                         vehicleListingAnalysis.model && 
                         vehicleListingAnalysis.year;

  return (
    <div className="mt-4 border border-border/60 rounded-lg overflow-hidden bg-background/50 shadow-sm">
      {/* Header section with vehicle details and image */}
      <div className="bg-background/80 p-3 border-b border-border/60">
        <div className="flex items-center gap-2 mb-2 text-carfix-600">
          <Car className="h-4 w-4" />
          <h4 className="font-medium">Vehicle Listing Analysis</h4>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Vehicle image (if available) */}
          {vehicleListingAnalysis.imageUrl && (
            <div className="md:w-2/5 rounded-md overflow-hidden border border-border/60 bg-black/5">
              <img 
                src={vehicleListingAnalysis.imageUrl} 
                alt={hasVehicleInfo ? 
                  `${vehicleListingAnalysis.year} ${vehicleListingAnalysis.make} ${vehicleListingAnalysis.model}` : 
                  "Vehicle Listing"}
                className="w-full object-cover h-48 md:h-40"
                onError={(e) => {
                  // Hide image on error
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Vehicle details */}
          <div className={`${vehicleListingAnalysis.imageUrl ? 'md:w-3/5' : 'w-full'}`}>
            {hasVehicleInfo && (
              <h3 className="text-lg font-semibold mb-1">
                {vehicleListingAnalysis.year} {vehicleListingAnalysis.make} {vehicleListingAnalysis.model}
              </h3>
            )}
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {vehicleListingAnalysis.price && (
                <div>
                  <span className="text-muted-foreground">Price:</span>{' '}
                  <span className="font-medium">{formatPrice(vehicleListingAnalysis.price)}</span>
                </div>
              )}
              
              {vehicleListingAnalysis.mileage && (
                <div>
                  <span className="text-muted-foreground">Mileage:</span>{' '}
                  <span className="font-medium">{formatMileage(vehicleListingAnalysis.mileage)}</span>
                </div>
              )}
              
              {vehicleListingAnalysis.vin && (
                <div className="col-span-2 mt-1">
                  <span className="text-muted-foreground">VIN:</span>{' '}
                  <span className="font-mono text-xs">{vehicleListingAnalysis.vin}</span>
                </div>
              )}
              
              {/* Description collapsible section */}
              {vehicleListingAnalysis.description && (
                <div className="col-span-2 mt-2">
                  <details className="text-sm">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Seller Description
                    </summary>
                    <p className="mt-1 text-muted-foreground whitespace-pre-wrap text-xs p-2 bg-muted/30 rounded border border-border/40">
                      {vehicleListingAnalysis.description.length > 300 
                        ? vehicleListingAnalysis.description.substring(0, 300) + '...' 
                        : vehicleListingAnalysis.description}
                    </p>
                  </details>
                </div>
              )}
            </div>
            
            {/* Link to original listing */}
            <div className="mt-3 flex items-center text-xs">
              <a 
                href={vehicleListingAnalysis.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-carfix-500 hover:underline flex items-center gap-1 bg-carfix-50 dark:bg-carfix-950/20 px-2 py-1 rounded"
              >
                <ExternalLink className="h-3 w-3" />
                <span>View on {formatUrl(vehicleListingAnalysis.url)}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis section */}
      <div className="p-3">
        <h5 className="font-medium mb-3 flex items-center gap-1.5">
          <Star className="h-4 w-4 text-carfix-500" />
          <span>AI Analysis</span>
        </h5>
        
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-green-700 dark:text-green-400">Reliability</strong>
              <p className="text-muted-foreground">{vehicleListingAnalysis.analysis.reliability}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <DollarSign className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-blue-700 dark:text-blue-400">Market Value</strong>
              <p className="text-muted-foreground">{vehicleListingAnalysis.analysis.marketValue}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Wrench className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-amber-700 dark:text-amber-400">Maintenance Needs</strong>
              <p className="text-muted-foreground">{vehicleListingAnalysis.analysis.maintenanceNeeds}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-red-700 dark:text-red-400">Red Flags</strong>
              <p className="text-muted-foreground">{vehicleListingAnalysis.analysis.redFlags}</p>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-border/60">
            <strong className="block mb-1 font-medium">Recommendation</strong>
            <p className="text-foreground">{vehicleListingAnalysis.analysis.recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleListingAnalysis;
