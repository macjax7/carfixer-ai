
import React, { FormEvent, useEffect, useRef } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { useDirectChatHandler } from '@/hooks/chat/useDirectChatHandler';
import EmptyChat from './EmptyChat';
import ChatThread from './ChatThread';
import ChatInputContainer from './ChatInputContainer';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const SimpleChatContainer: React.FC = () => {
  const {
    messages,
    input,
    setInput,
    isProcessing,
    sendMessage,
    resetChat,
    loadChatById,
    chatId,
    isLoading
  } = useDirectChatHandler();
  
  const { state } = useSidebar();
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const chatThreadRef = useRef<HTMLDivElement>(null);
  const hasManuallyScrolled = useRef(false);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatThreadRef.current && !hasManuallyScrolled.current) {
      const scrollElement = chatThreadRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages]);
  
  // Track when user manually scrolls up
  useEffect(() => {
    const handleScroll = () => {
      if (chatThreadRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatThreadRef.current;
        // If user has scrolled up more than 100px from bottom, mark as manually scrolled
        hasManuallyScrolled.current = scrollHeight - scrollTop - clientHeight > 100;
      }
    };
    
    const scrollElement = chatThreadRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // If there's a chat ID in the URL, load that chat
  useEffect(() => {
    if (params.chatId && params.chatId !== chatId) {
      loadChatById(params.chatId);
      // Reset manual scroll flag when loading a new chat
      hasManuallyScrolled.current = false;
    }
  }, [params.chatId, loadChatById, chatId]);
  
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      sendMessage(input);
      // Reset manual scroll flag when sending a new message
      hasManuallyScrolled.current = false;
    }
  };
  
  const handleTextInput = (text: string) => {
    if (text.trim() && !isProcessing) {
      sendMessage(text);
      // Reset manual scroll flag when sending a new message
      hasManuallyScrolled.current = false;
    }
  };
  
  const handleImageUpload = (file: File) => {
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      
      // Create a prompt based on the current input or use a default
      const prompt = input.trim() 
        ? input 
        : "Can you identify this car part or issue?";
        
      sendMessage(prompt, imageUrl);
      // Reset manual scroll flag when sending a new message
      hasManuallyScrolled.current = false;
    }
  };
  
  const handleListingAnalysis = (url: string) => {
    if (url && !isProcessing) {
      toast({
        title: "Analyzing listing",
        description: "Analyzing vehicle listing data...",
      });
      sendMessage(`Can you analyze this vehicle listing? ${url}`);
      // Reset manual scroll flag when sending a new message
      hasManuallyScrolled.current = false;
    }
  };
  
  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };
  
  const handleNewChat = () => {
    resetChat();
    setInput('');
    navigate('/');
    // Reset manual scroll flag when starting a new chat
    hasManuallyScrolled.current = false;
  };
  
  // Determine if we're in an empty chat state
  const isEmptyChat = messages.length === 0;
  
  // Check if the user has asked about their vehicle
  const hasAskedForVehicle = messages.some(msg => 
    msg.sender === 'user' && 
    (msg.text.toLowerCase().includes('my car') || 
     msg.text.toLowerCase().includes('my vehicle') ||
     msg.text.toLowerCase().includes('my truck') ||
     msg.text.toLowerCase().includes('my suv'))
  );
  
  // Show loading state while retrieving chat history
  if (isLoading && !isEmptyChat) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col h-full bg-background ${isEmptyChat ? 'justify-center' : ''}`}>
      {isEmptyChat ? (
        <EmptyChat
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          handleImageUpload={handleImageUpload}
          handleListingAnalysis={handleListingAnalysis}
          handleSuggestedPrompt={handleSuggestedPrompt}
          suggestedPrompts={[
            "What's wrong with my car if it makes a grinding noise when braking?",
            "How do I change my car's oil?",
            "What could cause my check engine light to come on?",
            "How often should I rotate my tires?",
            "What's a good maintenance schedule for a 2018 Honda Civic?"
          ]}
          isLoading={isProcessing}
        />
      ) : (
        <>
          <div 
            ref={chatThreadRef} 
            className="flex-1 overflow-y-auto"
          >
            <ChatThread 
              messages={messages}
              isLoading={isProcessing}
              hasAskedForVehicle={hasAskedForVehicle}
              sidebarState={state}
            />
          </div>
          <ChatInputContainer
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            handleImageUpload={handleImageUpload}
            handleListingAnalysis={handleListingAnalysis}
            isLoading={isProcessing}
            sidebarState={state}
            onNewChat={handleNewChat}
          />
        </>
      )}
    </div>
  );
};

export default React.memo(SimpleChatContainer);
