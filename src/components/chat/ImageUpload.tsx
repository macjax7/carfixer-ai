
import React, { useRef, useState } from 'react';
import { Image, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  onImageRemoved: () => void;
  onSuggestPrompt: (text: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  onImageRemoved,
  onSuggestPrompt,
  disabled = false,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    onImageSelected(file);
    
    // Reset the file input so the same file can be selected again
    e.target.value = '';
  };

  const removeSelectedImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    onImageRemoved();
  };

  return (
    <>
      {previewUrl && (
        <div className="relative inline-block">
          <img 
            src={previewUrl} 
            alt="Selected" 
            className="h-20 rounded-md object-contain bg-secondary/30 border border-border"
          />
          <button
            type="button"
            onClick={removeSelectedImage}
            className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow-sm border border-border"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />
      
      {!previewUrl && (
        <button
          type="button"
          onClick={openFilePicker}
          className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          disabled={disabled}
          aria-label="Upload image"
        >
          <Image className="h-5 w-5" />
        </button>
      )}
    </>
  );
};

export default ImageUpload;
