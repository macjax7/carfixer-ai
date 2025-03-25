
import React, { useState } from 'react';
import { Info, AlertCircle, DollarSign, Wrench, ShoppingCart } from 'lucide-react';
import { type PartResult } from '../../utils/part-identification/extractPartDetails';

interface ResultsDisplayProps {
  result: PartResult;
  rawAnalysis: string;
  onReset: () => void;
  selectedVehicle: any;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  result, 
  rawAnalysis, 
  onReset,
  selectedVehicle
}) => {
  const [showRawAnalysis, setShowRawAnalysis] = useState(false);

  const toggleRawAnalysis = () => {
    setShowRawAnalysis(!showRawAnalysis);
  };
  
  const openShoppingSearch = () => {
    let searchQuery = result.name;
    if (result.partNumber) {
      searchQuery += ` ${result.partNumber}`;
    }
    if (selectedVehicle) {
      searchQuery += ` ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`;
    }
    
    window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=shop`, '_blank');
  };

  return (
    <div className="bg-carfix-50 rounded-lg p-4 animate-scale">
      <div className="text-center mb-4">
        <h3 className="text-xl font-semibold text-carfix-700">{result.name}</h3>
        {result.partNumber && (
          <p className="text-sm bg-secondary/50 py-1 px-2 rounded-full inline-block mt-1">
            Part #: {result.partNumber}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Function Description */}
        <div className="bg-white p-3 rounded-lg border border-border">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 text-carfix-600 mr-2" />
            <h4 className="font-medium">Function</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {result.description.length > 200 
              ? `${result.description.slice(0, 200)}...` 
              : result.description}
          </p>
        </div>
        
        {/* Symptoms Section */}
        {result.symptoms && (
          <div className="bg-white p-3 rounded-lg border border-border">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
              <h4 className="font-medium">Failure Symptoms</h4>
            </div>
            <p className="text-sm text-muted-foreground">{result.symptoms}</p>
          </div>
        )}
        
        {/* Cost and Difficulty */}
        <div className="flex gap-3 flex-wrap md:flex-nowrap">
          {result.replacementCost && (
            <div className="bg-white p-3 rounded-lg border border-border flex-1">
              <div className="flex items-center mb-2">
                <DollarSign className="h-4 w-4 text-green-600 mr-2" />
                <h4 className="font-medium">Cost Estimate</h4>
              </div>
              <p className="text-sm text-muted-foreground">{result.replacementCost}</p>
            </div>
          )}
          
          {result.difficultyLevel && (
            <div className="bg-white p-3 rounded-lg border border-border flex-1">
              <div className="flex items-center mb-2">
                <Wrench className="h-4 w-4 text-carfix-600 mr-2" />
                <h4 className="font-medium">DIY Difficulty</h4>
              </div>
              <p className="text-sm text-muted-foreground">{result.difficultyLevel}</p>
            </div>
          )}
        </div>
        
        {/* Where to Buy Section */}
        {result.whereToFind && (
          <div className="bg-white p-3 rounded-lg border border-border">
            <div className="flex items-center mb-2">
              <ShoppingCart className="h-4 w-4 text-blue-600 mr-2" />
              <h4 className="font-medium">Where to Buy</h4>
            </div>
            <p className="text-sm text-muted-foreground">{result.whereToFind}</p>
          </div>
        )}
        
        {/* Raw Analysis and Action Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={toggleRawAnalysis}
            className="text-xs text-muted-foreground hover:text-foreground underline"
          >
            {showRawAnalysis ? "Hide full analysis" : "Show full analysis"}
          </button>
          
          <button
            onClick={openShoppingSearch}
            className="flex items-center gap-1 px-3 py-1.5 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Find Replacements</span>
          </button>
        </div>
        
        {/* Full Analysis Section */}
        {showRawAnalysis && (
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border">
            <h4 className="font-medium mb-2 text-sm">Full Analysis</h4>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{rawAnalysis}</p>
          </div>
        )}
        
        {/* Reset Button */}
        <div className="text-center mt-6">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
          >
            Identify Another Part
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;
