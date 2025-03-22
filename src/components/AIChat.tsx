
import React, { useState, useRef, useEffect } from 'react';
import { useDiagnostics } from '../context/DiagnosticContext';
import { useVehicles } from '../context/VehicleContext';
import { Send, Image, Loader2 } from 'lucide-react';

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
      text: 'Hello! I\'m your CarFix AI assistant. How can I help you with your vehicle today?',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { selectedVehicle } = useVehicles();
  const { currentSession } = useDiagnostics();
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // In a real app, this would call an AI API
    // For demo purposes, we'll simulate a response after a delay
    setTimeout(() => {
      const aiResponses = [
        `Based on your ${selectedVehicle ? selectedVehicle.make + ' ' + selectedVehicle.model : 'vehicle'}'s symptoms, this could be related to the fuel system. I'd recommend checking the fuel pressure regulator and fuel injectors.`,
        "If you're hearing a knocking sound from the engine, it could be a sign of worn bearings or low oil pressure. Have you checked the oil level recently?",
        "For the P0420 code, the catalytic converter is likely not functioning efficiently. This could be due to an oxygen sensor issue or the converter itself being worn out.",
        "The ABS light coming on is typically related to a wheel speed sensor or the ABS module itself. It would be good to scan for specific codes."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: randomResponse,
        timestamp: new Date()
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleImageUpload = () => {
    // In a real app, this would open a file picker and process the image
    console.log('Image upload clicked');
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-13rem)]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} chat-message`}
          >
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.sender === 'user' 
                  ? 'bg-carfix-600 text-white' 
                  : 'bg-secondary'
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start chat-message">
            <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t border-border p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <button 
            type="button"
            onClick={handleImageUpload}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Upload image"
          >
            <Image className="h-5 w-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your car problem..."
            className="flex-1 px-4 py-2 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-carfix-500 focus:border-carfix-500"
          />
          
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-full ${
              !input.trim() || isLoading
                ? 'bg-secondary text-muted-foreground'
                : 'bg-carfix-600 text-white hover:bg-carfix-700'
            } transition-colors`}
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
