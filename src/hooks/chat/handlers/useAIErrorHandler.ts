
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAIErrorHandler = () => {
  const { toast } = useToast();
  const [errorCount, setErrorCount] = useState(0);

  const handleSuccess = useCallback(() => {
    // Reset error count on successful response
    setErrorCount(0);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error("Error in AI processing:", error);
    
    // Increment error counter
    setErrorCount(prev => prev + 1);
    
    // Show toast for all errors, with different messages based on count
    toast({
      title: "Connection Issue",
      description: errorCount > 1 
        ? "Still having trouble connecting. Please check your internet connection and try again." 
        : "Having trouble connecting to the AI service.",
      variant: "destructive"
    });
    
    // Create a direct, simple fallback response
    return { 
      text: "I'm having trouble connecting to my knowledge database right now. Please check your internet connection and try again in a moment.", 
      extra: {} 
    };
  }, [errorCount, toast]);

  return {
    handleSuccess,
    handleError,
    errorCount
  };
};
