
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAIErrorHandler = () => {
  const { toast } = useToast();
  const [errorCount, setErrorCount] = useState(0);
  
  /**
   * Reset the error count on successful operations
   */
  const handleSuccess = useCallback(() => {
    if (errorCount > 0) {
      setErrorCount(0);
    }
  }, [errorCount]);
  
  /**
   * Handle errors when processing AI requests
   */
  const handleError = useCallback((error: any) => {
    console.error("AI processing error:", error);
    
    // Increment error count
    setErrorCount((count) => count + 1);
    
    // Generate user-friendly error message based on error type
    let errorMessage = "I'm having trouble responding right now. Please try again in a moment.";
    
    // If it's a network error (common with API calls)
    if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('timeout')) {
      errorMessage = "I'm having trouble connecting to my knowledge database right now. Please check your internet connection and try again in a moment.";
    } 
    // If it's an OpenAI API error
    else if (error.message?.includes('OpenAI API') || error.message?.includes('API key')) {
      errorMessage = "I'm having trouble accessing my automotive knowledge database. Our team has been notified and is working on a fix.";
    }
    // Rate limiting or token quota exceeded 
    else if (error.message?.includes('rate') || error.message?.includes('limit') || error.message?.includes('quota')) {
      errorMessage = "I've reached my capacity for diagnostic information right now. Please try again in a few minutes.";
    }
    // If we've had multiple consecutive errors, offer more helpful advice
    else if (errorCount >= 3) {
      errorMessage = "I'm still having trouble connecting to my diagnostic database. You might try refreshing the page or checking back later when our systems have recovered.";
    }
    
    // Show toast for a more visible error message
    toast({
      title: "Diagnostic Service Error",
      description: "There was a problem connecting to our vehicle diagnostic service. Please try again shortly.",
      variant: "destructive"
    });
    
    return {
      text: errorMessage,
      extra: {}
    };
  }, [errorCount, toast]);
  
  return {
    handleSuccess,
    handleError,
    errorCount
  };
};
