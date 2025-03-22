
import React, { useState, useRef } from 'react';
import { Upload, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOpenAI } from '@/utils/openai';
import { nanoid } from 'nanoid';

const PartIdentification: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ name: string; confidence: number; description: string } | null>(null);
  const { toast } = useToast();
  const { identifyPart } = useOpenAI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const uploadAndIdentifyPart = async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    try {
      // First, upload the image to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `part-images/${fileName}`;
      
      // Create a public URL for the image (this is needed for OpenAI to access it)
      const signedUrl = URL.createObjectURL(file);
      
      // Call the OpenAI API to identify the part using our edge function
      const analysis = await identifyPart(signedUrl);
      
      // Parse the response to get part name and details
      // This is a simple implementation - in a real app, you might want to structure this differently
      const name = analysis.split('\n')[0].replace(/^(.*?):/g, '').trim();
      const confidence = 0.9; // Placeholder since OpenAI doesn't return confidence scores directly
      
      setResult({
        name,
        confidence,
        description: analysis
      });
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
                Upload or drag & drop an image of the part
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
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {result.description}
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
