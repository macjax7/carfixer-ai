
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
        ? "Still having trouble connecting. Please try again shortly." 
        : "Having trouble connecting to the AI service.",
      variant: "destructive"
    });
    
    // Create a direct, simple fallback response
    return { 
      text: "Sorry, I'm having technical difficulties at the moment. Please try again shortly.", 
      extra: {} 
    };
  }, [errorCount, toast]);

  return {
    handleSuccess,
    handleError,
    errorCount
  };
};
