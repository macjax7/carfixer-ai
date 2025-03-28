
import { useToast } from "@/hooks/use-toast";

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleChatError = (error: any, message: string = "Processing Error") => {
    console.error(message, error);
    
    // Extract the most useful error information
    const errorMessage = error?.message || error?.details || 
      (typeof error === 'string' ? error : JSON.stringify(error));
    
    console.log("Detailed error information:", {
      message: errorMessage,
      code: error?.code,
      details: error?.details,
      stack: error?.stack
    });
    
    toast({
      variant: "destructive",
      title: message,
      description: "An error occurred while processing your message. Please try again."
    });
  };

  const handleAIProcessingError = (error: any) => {
    console.error("Error in AI processing:", error);
    
    // Check for common API errors
    const errorMessage = error?.message || 
      (typeof error === 'string' ? error : JSON.stringify(error));
    
    let detailedError = "Unknown error";
    
    try {
      // Try to extract more detailed error information
      if (error.response) {
        detailedError = `Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        detailedError = `No response received: ${error.request}`;
      } else if (error.message) {
        detailedError = error.message;
      } else if (typeof error === 'object') {
        detailedError = JSON.stringify(error);
      }
    } catch (e) {
      console.error("Error parsing error details:", e);
    }
    
    console.log("AI error details:", {
      message: errorMessage,
      detailedError,
      code: error?.code,
      status: error?.status,
      response: error?.response
    });
    
    toast({
      variant: "destructive",
      title: "AI Processing Error",
      description: "Failed to get a response from OpenAI. Please check your connection or try again later."
    });
    
    return "I apologize, but I encountered an error processing your request. Please try again or check if your OpenAI API key is valid and has sufficient credits.";
  };

  const handleUIError = (error: any, message: string = "UI Error") => {
    console.error(message, error);
    toast({
      variant: "destructive",
      title: message,
      description: "Something went wrong with the interface. Please refresh the page if this persists."
    });
  };

  return {
    handleChatError,
    handleAIProcessingError,
    handleUIError
  };
};
