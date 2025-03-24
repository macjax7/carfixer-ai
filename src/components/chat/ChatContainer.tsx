
import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { useChat } from '@/hooks/chat/useChat';
import EmptyChat from './EmptyChat';
import ChatThread from './ChatThread';
import ChatInputContainer from './ChatInputContainer';

const ChatContainer: React.FC = () => {
  const { chatId } = useParams<{ chatId?: string }>();
  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    suggestedPrompts,
    hasAskedForVehicle,
    loadChatById,
    chatIdLoaded
  } = useChat();
  
  const { state } = useSidebar();
  
  // Memoized function to reduce re-renders
  const memoizedHandleSendMessage = useCallback((e: React.FormEvent) => {
    handleSendMessage(e);
  }, [handleSendMessage]);
  
  // Load specific chat if chatId is provided in URL
  useEffect(() => {
    if (chatId && chatId !== chatIdLoaded) {
      loadChatById(chatId);
    }
  }, [chatId, loadChatById, chatIdLoaded]);
  
  // Memoize message props to prevent unnecessary re-renders
  const chatThreadProps = useMemo(() => ({
    messages,
    isLoading,
    hasAskedForVehicle,
    sidebarState: state
  }), [messages, isLoading, hasAskedForVehicle, state]);
  
  // Memoize input props to prevent unnecessary re-renders
  const inputContainerProps = useMemo(() => ({
    input,
    setInput,
    handleSendMessage: memoizedHandleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    isLoading,
    sidebarState: state
  }), [input, setInput, memoizedHandleSendMessage, handleImageUpload, handleListingAnalysis, isLoading, state]);
  
  // Memoize empty chat props to prevent unnecessary re-renders
  const emptyChatProps = useMemo(() => ({
    input,
    setInput,
    handleSendMessage: memoizedHandleSendMessage,
    handleImageUpload,
    handleListingAnalysis,
    handleSuggestedPrompt,
    suggestedPrompts,
    isLoading
  }), [input, setInput, memoizedHandleSendMessage, handleImageUpload, handleListingAnalysis, handleSuggestedPrompt, suggestedPrompts, isLoading]);
  
  // Chat state - empty or has messages
  const isEmptyChat = messages.length === 0;
  
  return (
    <div className={`flex flex-col h-full bg-background ${isEmptyChat ? 'justify-center' : ''}`}>
      {isEmptyChat ? (
        <EmptyChat {...emptyChatProps} />
      ) : (
        <>
          <ChatThread {...chatThreadProps} />
          <ChatInputContainer {...inputContainerProps} />
        </>
      )}
    </div>
  );
};

export default React.memo(ChatContainer);
