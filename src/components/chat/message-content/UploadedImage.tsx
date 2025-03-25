
import React from 'react';

interface UploadedImageProps {
  src: string;
}

const UploadedImage: React.FC<UploadedImageProps> = ({ src }) => {
  if (!src) return null;
  
  return (
    <div className="mb-2">
      <img 
        src={src} 
        alt="Uploaded" 
        className="rounded-lg max-h-48 w-auto object-contain bg-black/10"
      />
    </div>
  );
};

export default UploadedImage;
