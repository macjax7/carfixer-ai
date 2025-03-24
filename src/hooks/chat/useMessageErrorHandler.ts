
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from './useErrorHandler';

export const useMessageErrorHandler = () => {
  const { toast } = useToast();
  const { handleChatError, handleAIProcessingError } = useErrorHandler();

  /**
   * Handle database save errors
   */
  const handleDatabaseError = (error: any, operation: string) => {
    console.error(`Error during ${operation}:`, error);
    toast({
      title: "Message Storage Error",
      description: `Failed to ${operation}. Please try again.`,
      variant: "destructive"
    });
  };

  return {
    handleChatError,
    handleAIProcessingError,
    handleDatabaseError
  };
};
