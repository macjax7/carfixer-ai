
import { useToast } from "@/hooks/use-toast";

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleChatError = (error: any, message: string = "Processing Error") => {
    console.error(message, error);
    
    toast({
      variant: "destructive",
      title: message,
      description: "An error occurred while processing your message. Please try again."
    });
  };

  const handleAIProcessingError = (error: any) => {
    console.error("Error in AI processing:", error);
    
    toast({
      variant: "destructive",
      title: "AI Processing Error",
      description: "Failed to get a response from OpenAI. Please check your connection or try again later."
    });
    
    return "I apologize, but I encountered an error processing your request. Please try again.";
  };

  return {
    handleChatError,
    handleAIProcessingError
  };
};
