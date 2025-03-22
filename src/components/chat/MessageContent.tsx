
import React from 'react';
import { MessageContentProps } from './types';

const MessageContent: React.FC<MessageContentProps> = ({
  text,
  image,
  sender
}) => {
  // Convert URLs in text to clickable links
  const renderTextWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`${sender === 'user' ? 'text-white underline' : 'text-blue-500 hover:underline'}`}
          >
            {part}
          </a>
        );
      }
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
