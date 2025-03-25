
import React from 'react';

interface TextWithLinksProps {
  content: string;
  sender: 'user' | 'ai';
}

const TextWithLinks: React.FC<TextWithLinksProps> = ({ content, sender }) => {
  // Enhanced URL regex that matches more URL formats
  const urlRegex = /(https?:\/\/[^\s<]+[^<,.:\s])/g;
  
  // Platform-specific regexes for highlighting URLs
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
  
  const isYouTubeUrl = (url: string) => {
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.includes('youtube.com/watch') ||
      lowerUrl.includes('youtu.be/')
    );
  };
  
  const parts = content.split(urlRegex);
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          // This is a URL, create a link
          const truncatedUrl = part.length > 50 
            ? part.substring(0, 40) + '...' + part.substring(part.length - 10)
            : part;
            
          // Add special styling for different URL types
          const isVehicleListing = isVehicleListingUrl(part);
          const isYouTube = isYouTubeUrl(part);
          
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
                    : isYouTube
                      ? 'text-red-600 font-medium hover:underline'
                      : 'text-blue-500 hover:underline'
              }`}
              title={
                isVehicleListing 
                  ? "Vehicle listing URL - Ask me to analyze it!" 
                  : isYouTube
                    ? "YouTube video - Click to watch"
                    : part
              }
            >
              {isVehicleListing && sender === 'user' ? "📃 " : ""}
              {isYouTube && sender === 'ai' ? "🎬 " : ""}
              {truncatedUrl}
              {isVehicleListing && sender === 'user' ? " 🚗" : ""}
              {isYouTube && sender === 'ai' ? " 📹" : ""}
            </a>
          );
        }
        // This is regular text, just render it
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

export default TextWithLinks;
