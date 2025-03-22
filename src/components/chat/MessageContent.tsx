
import React from 'react';

interface MessageContentProps {
  text: string;
  image?: string;
  sender: 'user' | 'ai';
}

const MessageContent: React.FC<MessageContentProps> = ({
  text,
  image,
  sender
}) => {
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
      
      <p className="text-sm md:text-base whitespace-pre-wrap">{text}</p>
    </>
  );
};

export default MessageContent;
