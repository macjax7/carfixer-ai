
import React, { useRef } from 'react';
import { Upload, Camera, AlertCircle, Loader2 } from 'lucide-react';

interface UploadSectionProps {
  isUploading: boolean;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onCameraClick: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  isUploading,
  error,
  onFileChange,
  onDrop,
  onDragOver,
  onCameraClick
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="border-2 border-dashed border-muted rounded-lg p-6 text-center transition-colors hover:border-muted-foreground"
    >
      <input
        id="file-upload"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-10 w-10 text-carfix-600 animate-spin mb-4" />
          <p className="text-muted-foreground">Analyzing image...</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <Upload className="h-10 w-10 text-muted-foreground" />
          </div>
          
          <p className="text-muted-foreground mb-4">
            Upload or drag & drop an image of the part you want to identify
          </p>
          
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-carfix-600 text-white rounded-lg hover:bg-carfix-700 transition-colors"
            >
              Upload Image
            </button>
            
            <button
              onClick={onCameraClick}
              className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Camera className="h-4 w-4 inline mr-1" />
              Camera
            </button>
          </div>
          
          {error && (
            <div className="mt-4 flex items-center space-x-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UploadSection;
