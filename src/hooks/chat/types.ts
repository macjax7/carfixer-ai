
import { Message } from '@/components/chat/types';

export interface ChatMessagesState {
  messages: Message[];
  messageHistory: string[];
  chatId: string | null;
  isLoading: boolean;
}

export interface ChatMessagesActions {
  addUserMessage: (messageData: Message) => Message;
  addAIMessage: (messageData: Message) => Message;
  getMessagesForAPI: (userMessage: Message) => Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  resetChat: () => void;
  addMessage: (message: Message) => void;
  setChatId: (id: string) => void;
}

export type UseChatMessagesResult = ChatMessagesState & ChatMessagesActions;
