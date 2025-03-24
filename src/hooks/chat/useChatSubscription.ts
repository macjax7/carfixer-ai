
import { Message } from '@/components/chat/types';
import { ChatSubscriptionProps } from './types';
import { useRealTimeMessages } from './useRealTimeMessages';

export const useChatSubscription = ({
  chatId,
  setMessages,
  setMessageHistory
}: ChatSubscriptionProps) => {
  // Create a function to add messages to the UI
  const addMessage = (newMsg: Message) => {
    setMessages(prevMessages => {
      // Check if the message is already in the array to avoid duplicates
      if (!prevMessages.some(msg => msg.id === newMsg.id)) {
        return [...prevMessages, newMsg];
      }
      return prevMessages;
    });
  };
  
  // Set up real-time subscription to chat messages
  useRealTimeMessages(chatId, addMessage, setMessageHistory);
};

export default useChatSubscription;
