
import { useCallback } from 'react';
import { useChatMessages } from './useChatMessages';
import { ChatHistoryItem } from '@/components/chat/sidebar/useSidebarState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useChatHistory = () => {
  const { messages, chatId, resetChat } = useChatMessages();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const saveCurrentChat = useCallback(async () => {
    if (messages.length === 0 || !chatId || !user) return;
    
    const firstUserMessage = messages.find(m => m.sender === 'user');
    if (!firstUserMessage) return;
    
    const title = firstUserMessage.text.length > 30 
      ? firstUserMessage.text.substring(0, 30) + '...' 
      : firstUserMessage.text;
    
    try {
      // Update the chat session title
      const { error } = await supabase
        .from('chat_sessions')
        .upsert({
          id: chatId,
          title,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      console.log('Chat saved successfully:', chatId);
    } catch (error) {
      console.error('Error saving chat to history:', error);
      toast({
        title: "Error",
        description: "Failed to save chat to history. Please try again.",
        variant: "destructive"
      });
    }
  }, [messages, chatId, user, toast]);
  
  return {
    saveCurrentChat,
    resetChat
  };
};
