import React, { useState, useRef, useEffect } from 'react';
import { useDiagnostics } from '../context/DiagnosticContext';
import { useVehicles } from '../context/VehicleContext';
import { Send, Image, Loader2, Mic, Sparkles, LightbulbIcon } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Textarea } from './ui/textarea';
import { useOpenAI, ChatMessage } from '@/utils/openai';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your CarFix AI assistant. How can I help with your vehicle today?",
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const { selectedVehicle } = useVehicles();
  const { currentSession } = useDiagnostics();
  const { chatWithAI } = useOpenAI();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    try {
      // Prepare the messages array for the API
      const apiMessages: ChatMessage[] = messages
        .filter(msg => msg.id !== '1') // Filter out the welcome message
        .concat(userMessage)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));
      
      // Call the OpenAI API
      const aiResponse = await chatWithAI(apiMessages);
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUpload = () => {
    // In a real app, this would open a file picker and process the image
    console.log('Image upload clicked');
  };

  // Auto-resize textarea as user types
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  // Handle keyboard shortcut (Enter to send, Shift+Enter for new line)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Suggested prompts that users can click on
  const suggestedPrompts = [
    "What could cause a P0300 code?",
    "My engine is overheating",
    "How do I change brake pads?",
    "What does the check engine light mean?"
  ];

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Welcome message when no messages exist (except default) */}
      {messages.length === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-6">
          <h1 className="text-3xl font-bold text-foreground text-center bg-gradient-to-r from-carfix-500 to-carfix-700 bg-clip-text text-transparent">
            How can I help with your vehicle?
          </h1>
          
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedPrompt(prompt)}
                className="text-sm px-4 py-3 bg-secondary/80 hover:bg-secondary rounded-xl text-left transition-colors duration-200 border border-border flex items-start"
              >
                <LightbulbIcon className="h-4 w-4 mr-2 text-carfix-500 flex-shrink-0 mt-0.5" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Chat messages */}
      {messages.length > 1 && (
        <ScrollArea className="flex-1 pt-4 px-2 md:px-4">
          <div className="max-w-3xl mx-auto space-y-6 pb-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex chat-message",
                  msg.sender === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div 
                  className={cn(
                    "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3",
                    msg.sender === 'user' 
                      ? "bg-carfix-600 text-white" 
                      : "bg-secondary/80 border border-border"
                  )}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex items-center mb-2">
                      <Sparkles className="h-4 w-4 text-carfix-500 mr-2" />
                      <span className="text-xs font-medium text-carfix-500">CarFix AI</span>
                    </div>
                  )}
                  <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start chat-message">
                <div className="bg-secondary/80 border border-border rounded-2xl px-4 py-3 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-carfix-500" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}
      
      {/* Input form */}
      <div className="border-t border-border bg-background/95 backdrop-blur-sm py-3 px-3 md:px-4">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
          <div className="flex items-end rounded-xl border border-input bg-background focus-within:ring-1 focus-within:ring-carfix-500 focus-within:border-carfix-500 overflow-hidden">
            <button 
              type="button"
              onClick={handleImageUpload}
              className="p-3 text-muted-foreground hover:text-foreground transition-colors self-end"
              aria-label="Upload image"
            >
              <Image className="h-5 w-5" />
            </button>
            
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your car problem..."
              className="flex-1 max-h-[120px] border-0 focus-visible:ring-0 resize-none py-3 px-0"
              rows={1}
            />
            
            <button 
              type="button"
              className="p-3 text-muted-foreground hover:text-foreground transition-colors self-end mr-1"
              aria-label="Voice input"
            >
              <Mic className="h-5 w-5" />
            </button>
            
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "p-2 rounded-lg mr-2 mb-2 transition-colors",
                !input.trim() || isLoading
                  ? "bg-secondary text-muted-foreground"
                  : "bg-carfix-600 text-white hover:bg-carfix-700"
              )}
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-2">
            CarFix AI may display inaccurate info. Always verify with manufacturer service manuals.
          </p>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
