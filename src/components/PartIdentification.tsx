
import React, { useState, useRef } from 'react';
import { Upload, Camera, AlertCircle, Loader2, ShoppingCart, Info, Wrench, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOpenAI } from '@/utils/openai';
import { nanoid } from 'nanoid';
import { Separator } from '@/components/ui/separator';
import { useVehicles } from '@/hooks/use-vehicles';

interface PartResult {
  name: string;
  partNumber?: string;
  description: string;
  replacementCost?: string;
  difficultyLevel?: string;
  whereToFind?: string;
  symptoms?: string;
}

const extractPartDetails = (analysis: string): PartResult => {
  const result: PartResult = {
    name: 'Unknown Part',
    description: analysis,
  };

  // Extract part name (usually the first line or after "Part Name:" or similar)
  const nameMatch = analysis.match(/^([^:]+?)(?::|\n|$)/) || 
                    analysis.match(/Part(?:\s+)Name(?:\s*):(?:\s*)([^\n]+)/i) ||
                    analysis.match(/Part(?:\s+)Identification(?:\s*):(?:\s*)([^\n]+)/i);
  if (nameMatch && nameMatch[1]) {
    result.name = nameMatch[1].trim();
  }

  // Extract part number if present
  const partNumberMatch = analysis.match(/part(?:\s+)number(?:\s*):(?:\s*)([A-Z0-9-]+)/i) ||
                          analysis.match(/OEM(?:\s+)(?:part(?:\s+))?number(?:\s*):(?:\s*)([A-Z0-9-]+)/i) ||
                          analysis.match(/([A-Z0-9]{5,}-[A-Z0-9]{2,}[A-Z0-9]*)/i);
  if (partNumberMatch && partNumberMatch[1]) {
    result.partNumber = partNumberMatch[1].trim();
  }

  // Extract replacement cost
  const costMatch = analysis.match(/(?:replacement(?:\s+)cost|cost|price)(?:\s*):(?:\s*)([^.]+)/i) ||
                   analysis.match(/\$(\d+(?:,\d+)?(?:\.\d+)?(?:\s*-\s*\$\d+(?:,\d+)?(?:\.\d+)?)?)/i);
  if (costMatch && costMatch[1]) {
    result.replacementCost = costMatch[1].trim();
  }

  // Extract difficulty level
  const difficultyMatch = analysis.match(/difficulty(?:\s+)level(?:\s*):(?:\s*)([^.]+)/i) ||
                         analysis.match(/(?:diy|replacement)(?:\s+)difficulty(?:\s*):(?:\s*)([^.]+)/i);
  if (difficultyMatch && difficultyMatch[1]) {
    result.difficultyLevel = difficultyMatch[1].trim();
  }

  // Extract where to find replacement
  const whereMatch = analysis.match(/(?:where(?:\s+)to(?:\s+)(?:find|buy|purchase)|purchase(?:\s+)options)(?:\s*):(?:\s*)([^.]+(?:\.[^.]+)*)/i);
  if (whereMatch && whereMatch[1]) {
    result.whereToFind = whereMatch[1].trim();
  }

  // Extract symptoms when part fails
  const symptomsMatch = analysis.match(/(?:symptoms|when(?:\s+)this(?:\s+)part(?:\s+)fails|failure(?:\s+)symptoms)(?:\s*):(?:\s*)([^.]+(?:\.[^.]+)*)/i);
  if (symptomsMatch && symptomsMatch[1]) {
    result.symptoms = symptomsMatch[1].trim();
  }

  return result;
};

const PartIdentification: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PartResult | null>(null);
  const [rawAnalysis, setRawAnalysis] = useState<string>("");
  const [showRawAnalysis, setShowRawAnalysis] = useState(false);
  const { toast } = useToast();
  const { identifyPart } = useOpenAI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedVehicle } = useVehicles();
  
  const uploadAndIdentifyPart = async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    try {
      // Create a public URL for the image (this is needed for OpenAI to access it)
      const signedUrl = URL.createObjectURL(file);
      
      // Craft the prompt based on whether user has selected a vehicle
      let prompt = "Identify this car part in detail, including its name, function, and possible part numbers.";
      if (selectedVehicle) {
        prompt = `Identify this car part from a ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}. Include the exact OEM part number if possible, its function, common failure symptoms, and replacement cost.`;
      }
      
      // Call the OpenAI API to identify the part using our edge function
      const analysis = await identifyPart(signedUrl, prompt);
      
      // Save the raw analysis for reference
      setRawAnalysis(analysis);
      
      // Process the analysis to extract structured information
      const partDetails = extractPartDetails(analysis);
      
      setResult(partDetails);
    } catch (error) {
      console.error('Error identifying part:', error);
      setError('Failed to identify the part. Please try again.');
      toast({
        title: "Error",
        description: "Could not identify the part. Please try again with a clearer image.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    uploadAndIdentifyPart(file);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files?.[0];
    
    if (!file) {
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    uploadAndIdentifyPart(file);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleCameraClick = () => {
    // In a real app, this would open the device camera
    fileInputRef.current?.click();
  };
  
  const toggleRawAnalysis = () => {
    setShowRawAnalysis(!showRawAnalysis);
  };
  
  const openShoppingSearch = () => {
    if (!result) return;
    
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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
      <h2 className="text-lg font-medium mb-3">Identify Part</h2>
      
      {!result ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-muted rounded-lg p-6 text-center transition-colors hover:border-muted-foreground"
        >
          <input
            id="file-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="h-10 w-10 text-carfix-600 animate-spin mb-4" />
              <p className="text-muted-foreground">Analyzing image...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              
              <p className="text-muted-foreground mb-4">
                Upload or drag & drop an image of the part you want to identify
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
                >
                  Upload Image
                </button>
                
                <button
                  onClick={handleCameraClick}
                  className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <Camera className="h-4 w-4 inline mr-1" />
                  Camera
                </button>
              </div>
              
              {error && (
                <div className="mt-4 flex items-center space-x-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
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
            
            {result.symptoms && (
              <div className="bg-white p-3 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                  <h4 className="font-medium">Failure Symptoms</h4>
                </div>
                <p className="text-sm text-muted-foreground">{result.symptoms}</p>
              </div>
            )}
            
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
            
            {result.whereToFind && (
              <div className="bg-white p-3 rounded-lg border border-border">
                <div className="flex items-center mb-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600 mr-2" />
                  <h4 className="font-medium">Where to Buy</h4>
                </div>
                <p className="text-sm text-muted-foreground">{result.whereToFind}</p>
              </div>
            )}
            
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
            
            {showRawAnalysis && (
              <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border">
                <h4 className="font-medium mb-2 text-sm">Full Analysis</h4>
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">{rawAnalysis}</p>
              </div>
            )}
            
            <div className="text-center mt-6">
              <button
                onClick={() => setResult(null)}
                className="px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
              >
                Identify Another Part
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartIdentification;
