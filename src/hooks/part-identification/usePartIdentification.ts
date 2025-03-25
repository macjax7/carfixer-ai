
import { useState } from 'react';
import { useOpenAI } from '@/utils/openai/hook';
import { useToast } from '@/components/ui/use-toast';
import { extractPartDetails, type PartResult } from '@/utils/part-identification/extractPartDetails';

export const usePartIdentification = (selectedVehicle: any) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PartResult | null>(null);
  const [rawAnalysis, setRawAnalysis] = useState<string>("");
  const { toast } = useToast();
  const { identifyPart } = useOpenAI();

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
  
  const resetAnalysis = () => {
    setResult(null);
    setRawAnalysis("");
    setError(null);
  };

  return {
    isUploading,
    error,
    result,
    rawAnalysis,
    handleFileChange,
    handleDrop,
    handleDragOver,
    resetAnalysis
  };
};
