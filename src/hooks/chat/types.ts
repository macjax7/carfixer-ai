
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

// Add new types for improved organization
export interface ChatStorageOperations {
  createChatSession: (message: Message) => Promise<string | undefined>;
  storeUserMessage: (messageData: Message, sessionId: string) => Promise<void>;
  storeAIMessage: (messageData: Message, sessionId: string) => Promise<void>;
  fetchLastChatSession: () => Promise<{id: string, title: string} | null>;
  fetchChatMessages: (sessionId: string) => Promise<any[]>;
}

export interface ChatSubscriptionProps {
  chatId: string | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setMessageHistory: React.Dispatch<React.SetStateAction<string[]>>;
}
