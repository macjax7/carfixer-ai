
import React from 'react';
import { MessageContentProps } from './types';

const MessageContent: React.FC<MessageContentProps> = ({
  text,
  image,
  sender
}) => {
  // Convert URLs in text to clickable links
  const renderTextWithLinks = (content: string) => {
    // Enhanced URL regex that matches more URL formats
    const urlRegex = /(https?:\/\/[^\s<]+[^<,.:\s])/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        // This is a URL, create a link
        const truncatedUrl = part.length > 50 
          ? part.substring(0, 40) + '...' + part.substring(part.length - 10)
          : part;
          
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`${sender === 'user' ? 'text-white underline opacity-90 hover:opacity-100' : 'text-blue-500 hover:underline'}`}
            title={part}
          >
            {truncatedUrl}
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
