
import React from 'react';
import { MessageContentProps } from './types';

const MessageContent: React.FC<MessageContentProps> = ({
  text,
  image,
  sender
}) => {
  // Enhanced URL regex that matches more URL formats, specifically targeting vehicle listing platforms
  const renderTextWithLinks = (content: string) => {
    // Enhanced URL regex that matches more URL formats, with specific attention to vehicle listing sites
    const urlRegex = /(https?:\/\/[^\s<]+[^<,.:\s])/g;
    
    // Platform-specific regexes for highlighting vehicle listing URLs
    const isVehicleListingUrl = (url: string) => {
      const lowerUrl = url.toLowerCase();
      return (
        lowerUrl.includes('cars.com') ||
        lowerUrl.includes('autotrader.com') ||
        lowerUrl.includes('cargurus.com') ||
        lowerUrl.includes('edmunds.com') ||
        lowerUrl.includes('craigslist.org') && (
          lowerUrl.includes('/cto/') || 
          lowerUrl.includes('/ctd/') || 
          lowerUrl.includes('cars+trucks')
        ) ||
        lowerUrl.includes('facebook.com/marketplace') ||
        lowerUrl.includes('marketplace.facebook.com') ||
        lowerUrl.includes('carmax.com') ||
        lowerUrl.includes('truecar.com') ||
        lowerUrl.includes('ebay.com/itm') && lowerUrl.includes('motors')
      );
    };
    
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        // This is a URL, create a link
        const truncatedUrl = part.length > 50 
          ? part.substring(0, 40) + '...' + part.substring(part.length - 10)
          : part;
          
        // Add special styling for vehicle listing URLs
        const isVehicleListing = isVehicleListingUrl(part);
        
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`${
              sender === 'user' 
                ? 'text-white underline opacity-90 hover:opacity-100' 
                : isVehicleListing 
                  ? 'text-carfix-600 font-medium hover:underline' 
                  : 'text-blue-500 hover:underline'
            }`}
            title={isVehicleListing ? "Vehicle listing URL - Ask me to analyze it!" : part}
          >
            {isVehicleListing && sender === 'user' ? "📃 " : ""}
            {truncatedUrl}
            {isVehicleListing && sender === 'user' ? " 🚗" : ""}
          </a>
        );
      }
      // This is regular text, just render it
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {image && (
        <div className="mb-2">
          <img 
            src={image} 
            alt="Uploaded" 
            className="rounded-lg max-h-48 w-auto object-contain bg-black/10"
          />
        </div>
      )}
      
      <p className="text-sm md:text-base whitespace-pre-wrap">
        {renderTextWithLinks(text)}
      </p>
    </>
  );
};

export default MessageContent;
