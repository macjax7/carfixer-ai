
import React, { useEffect, useState } from 'react';
import { Wrench, Sparkles } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
  const [showSparkle, setShowSparkle] = useState(false);
  
  // Randomly show sparkles effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 600);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex justify-start chat-message">
      <div className="relative bg-gradient-to-r from-secondary/90 via-secondary/70 to-secondary/90 border border-border rounded-2xl px-5 py-5 flex items-center justify-center overflow-hidden">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-carfix-100/20 to-carfix-200/10 animate-pulse-light" />
        
        {/* Bolt element that the wrench interacts with */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-3 h-3 bg-engine-500 rounded-md transform -translate-x-1/2 -translate-y-1/4" />
          
          {/* Wrench animation */}
          <div className="relative z-10">
            <Wrench 
              className="h-6 w-6 text-carfix-500" 
              style={{ 
                animation: 'turn-wrench 1.5s infinite ease-in-out',
                transformOrigin: '55% 55%'
              }} 
            />
            
            {/* Bolt highlight effect */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-carfix-400 rounded-full animate-pulse-light"></div>
          </div>
          
          {/* Sparkle effect that appears occasionally */}
          {showSparkle && (
            <div className="absolute -top-3 -right-3 animate-scale">
              <Sparkles className="h-4 w-4 text-carfix-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
