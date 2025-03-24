
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
  
  // Load specific chat if chatId is provided in URL - but don't show loading state
  useEffect(() => {
    if (chatId && chatId !== chatIdLoaded) {
      loadChatById(chatId);
    }
  }, [chatId, loadChatById, chatIdLoaded]);
  
  // Memoize the message-related props to prevent unnecessary re-renders
  const memoizedMessageProps = useMemo(() => ({
    messages,
    isLoading,
    hasAskedForVehicle
  }), [messages, isLoading, hasAskedForVehicle]);
  
  // Chat state - empty or has messages
  const isEmptyChat = messages.length === 0;
  
  return (
    <div className={`flex flex-col h-full bg-background ${isEmptyChat ? 'justify-center' : ''}`}>
      {isEmptyChat ? (
        <EmptyChat 
          input={input}
          setInput={setInput}
          handleSendMessage={memoizedHandleSendMessage}
          handleImageUpload={handleImageUpload}
          handleListingAnalysis={handleListingAnalysis}
          handleSuggestedPrompt={handleSuggestedPrompt}
          suggestedPrompts={suggestedPrompts}
          isLoading={isLoading}
        />
      ) : (
        <>
          <ChatThread 
            messages={memoizedMessageProps.messages}
            isLoading={memoizedMessageProps.isLoading}
            hasAskedForVehicle={memoizedMessageProps.hasAskedForVehicle}
            sidebarState={state}
          />
          
          <ChatInputContainer
            input={input}
            setInput={setInput}
            handleSendMessage={memoizedHandleSendMessage}
            handleImageUpload={handleImageUpload}
            handleListingAnalysis={handleListingAnalysis}
            isLoading={isLoading}
            sidebarState={state}
          />
        </>
      )}
    </div>
  );
};

export default ChatContainer;
