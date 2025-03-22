
import React, { useState } from 'react';
import { Upload, Camera, AlertCircle, Loader2 } from 'lucide-react';

const PartIdentification: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; confidence: number } | null>(null);
  
  const simulatePartIdentification = (file: File) => {
    setIsUploading(true);
    setError(null);
    
    // In a real app, this would send the image to an AI vision API
    // For demo purposes, we'll simulate a response after a delay
    setTimeout(() => {
      const randomParts = [
        { name: 'Alternator', confidence: 0.92 },
        { name: 'Oxygen Sensor', confidence: 0.87 },
        { name: 'Ignition Coil', confidence: 0.94 },
        { name: 'Mass Air Flow Sensor', confidence: 0.89 },
        { name: 'Fuel Injector', confidence: 0.91 }
      ];
      
      const randomResult = randomParts[Math.floor(Math.random() * randomParts.length)];
      
      setResult(randomResult);
      setIsUploading(false);
    }, 2000);
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
    
    simulatePartIdentification(file);
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
    
    simulatePartIdentification(file);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleCameraClick = () => {
    // In a real app, this would open the device camera
    document.getElementById('file-upload')?.click();
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
                Upload or drag & drop an image of the part
              </p>
              
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => document.getElementById('file-upload')?.click()}
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
                <div className="mt-4 flex items-center space-x-2 text-alert text-sm">
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
            <h3 className="text-xl font-medium text-carfix-700">{result.name}</h3>
            <p className="text-sm text-muted-foreground">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-white p-3 rounded-lg border border-border mb-4">
            <h4 className="font-medium mb-1">Part Information</h4>
            <p className="text-sm text-muted-foreground">
              Common in many modern vehicles, the {result.name.toLowerCase()} is an essential component of the engine's electrical system.
            </p>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setResult(null)}
              className="px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
            >
              Identify Another Part
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartIdentification;
