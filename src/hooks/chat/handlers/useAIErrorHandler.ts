
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAIErrorHandler = () => {
  const { toast } = useToast();
  const [consecutiveErrorCount, setConsecutiveErrorCount] = useState(0);
  const connectionErrorTimerRef = useRef<number | null>(null);

  // Reset error count after a period of no errors
  const resetErrorCountAfterDelay = useCallback(() => {
    if (connectionErrorTimerRef.current) {
      window.clearTimeout(connectionErrorTimerRef.current);
    }
    
    connectionErrorTimerRef.current = window.setTimeout(() => {
      setConsecutiveErrorCount(0);
    }, 60000); // Reset after 1 minute of no errors
  }, []);

  const handleSuccess = useCallback(() => {
    // Reset error count on successful response
    setConsecutiveErrorCount(0);
    resetErrorCountAfterDelay();
  }, [resetErrorCountAfterDelay]);

  const handleError = useCallback((error: any) => {
    console.error("Error in AI processing, using fallback:", error);
    
    // Increment error counter
    setConsecutiveErrorCount(prev => prev + 1);
    
    // Show toast for persistent errors
    if (consecutiveErrorCount >= 2) {
      toast({
        title: "Connection Issues",
        description: "Having trouble reaching the AI service. Please check your connection.",
        variant: "destructive"
      });
    }
    
    // Create a fallback response depending on number of consecutive errors
    let fallbackMessage;
    if (consecutiveErrorCount >= 3) {
      fallbackMessage = "I'm experiencing persistent connectivity issues. I'll be available once the connection is restored. In the meantime, you might want to check your vehicle's service manual or try again later.";
    } else if (consecutiveErrorCount >= 1) {
      fallbackMessage = "I'm having trouble connecting to my knowledge database. Please try again in a moment. If this continues, it may be a temporary service outage.";
    } else {
      fallbackMessage = "I apologize, but I'm having trouble connecting to my knowledge database. Please try your question again in a moment.";
    }
    
    return { text: fallbackMessage, extra: {} };
  }, [consecutiveErrorCount, toast, resetErrorCountAfterDelay]);

  return {
    handleSuccess,
    handleError,
    consecutiveErrorCount
  };
};
