
import React from 'react';
import { CheckCircle, Car, AlertTriangle, DollarSign, Wrench, Star, ExternalLink, Calendar, Gauge } from 'lucide-react';

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

  // Get platform name from URL
  const getPlatformName = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('craigslist.org')) return 'Craigslist';
    if (lowerUrl.includes('facebook.com') || lowerUrl.includes('marketplace')) return 'Facebook Marketplace';
    if (lowerUrl.includes('cargurus.com')) return 'CarGurus';
    if (lowerUrl.includes('edmunds.com')) return 'Edmunds';
    if (lowerUrl.includes('autotrader.com')) return 'AutoTrader';
    if (lowerUrl.includes('cars.com')) return 'Cars.com';
    if (lowerUrl.includes('truecar.com')) return 'TrueCar';
    if (lowerUrl.includes('carmax.com')) return 'CarMax';
    if (lowerUrl.includes('ebay.com')) return 'eBay Motors';
    return 'Listing Site';
  };

  // Determine if we have enough vehicle info to show the full header
  const hasVehicleInfo = vehicleListingAnalysis.make || 
                         vehicleListingAnalysis.model || 
                         vehicleListingAnalysis.year;

  // Get class for data status (red for missing data, green for present)
  const getStatusClass = (value: any, isImportant = false) => {
    if (value === undefined || value === null || value === '') {
      return isImportant ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  // Get vehicle title - formatted based on available info
  const getVehicleTitle = () => {
    const { year, make, model } = vehicleListingAnalysis;
    
    if (year && make && model) {
      return `${year} ${make} ${model}`;
    } else if (make && model) {
      return `${make} ${model}`;
    } else if (year && (make || model)) {
      return `${year} ${make || model}`;
    } else if (make) {
      return make;
    } else if (model) {
      return model;
    } else if (year) {
      return `${year} Vehicle`;
    }
    
    return "Vehicle Listing";
  };

  return (
    <div className="mt-4 border border-border/60 rounded-lg overflow-hidden bg-background/50 shadow-sm">
      {/* Header section with vehicle details and image */}
      <div className="bg-background/80 p-3 border-b border-border/60">
        <div className="flex items-center gap-2 mb-2 text-carfix-600">
          <Car className="h-4 w-4" />
          <h4 className="font-medium">Vehicle Listing Analysis</h4>
          <span className="text-xs bg-carfix-100 dark:bg-carfix-900/50 text-carfix-800 dark:text-carfix-300 px-2 py-0.5 rounded-full">
            {getPlatformName(vehicleListingAnalysis.url)}
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Vehicle image (if available) */}
          {vehicleListingAnalysis.imageUrl && (
            <div className="md:w-2/5 rounded-md overflow-hidden border border-border/60 bg-black/5 relative">
              <img 
                src={vehicleListingAnalysis.imageUrl} 
                alt={hasVehicleInfo ? getVehicleTitle() : "Vehicle Listing"}
                className="w-full object-cover h-48 md:h-40"
                onError={(e) => {
                  // Hide image on error
                  (e.target as HTMLImageElement).style.display = 'none';
                  // Add a placeholder background
                  (e.target as HTMLImageElement).parentElement!.classList.add('bg-muted');
                  // Add a placeholder icon
                  const placeholder = document.createElement('div');
                  placeholder.className = 'absolute inset-0 flex items-center justify-center text-muted-foreground';
                  placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>';
                  (e.target as HTMLImageElement).parentElement!.appendChild(placeholder);
                }}
              />
            </div>
          )}
          
          {/* Vehicle details */}
          <div className={`${vehicleListingAnalysis.imageUrl ? 'md:w-3/5' : 'w-full'}`}>
            {hasVehicleInfo && (
              <h3 className="text-lg font-semibold mb-1">
                {getVehicleTitle()}
              </h3>
            )}
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {/* Year info */}
              <div className={getStatusClass(vehicleListingAnalysis.year, true)}>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-muted-foreground">Year:</span>
                </span>{' '}
                <span className="font-medium">
                  {vehicleListingAnalysis.year || 'Not specified'}
                </span>
              </div>
              
              {/* Make/Model info */}
              <div className={getStatusClass(vehicleListingAnalysis.make || vehicleListingAnalysis.model, true)}>
                <span className="inline-flex items-center gap-1">
                  <Car className="h-3.5 w-3.5" />
                  <span className="text-muted-foreground">Make/Model:</span>
                </span>{' '}
                <span className="font-medium">
                  {vehicleListingAnalysis.make || ''} {vehicleListingAnalysis.model || ''}
                  {!vehicleListingAnalysis.make && !vehicleListingAnalysis.model && 'Not specified'}
                </span>
              </div>
              
              {/* Price info */}
              <div className={getStatusClass(vehicleListingAnalysis.price)}>
                <span className="inline-flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span className="text-muted-foreground">Price:</span>
                </span>{' '}
                <span className="font-medium">{formatPrice(vehicleListingAnalysis.price)}</span>
              </div>
              
              {/* Mileage info */}
              <div className={getStatusClass(vehicleListingAnalysis.mileage)}>
                <span className="inline-flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  <span className="text-muted-foreground">Mileage:</span>
                </span>{' '}
                <span className="font-medium">{formatMileage(vehicleListingAnalysis.mileage)}</span>
              </div>
              
              {/* VIN info */}
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
