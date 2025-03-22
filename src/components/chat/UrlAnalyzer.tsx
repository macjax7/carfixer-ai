
import React, { useState } from 'react';
import { Link, X, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface UrlAnalyzerProps {
  onUrlSubmit: (url: string) => void;
  disabled?: boolean;
}

const UrlAnalyzer: React.FC<UrlAnalyzerProps> = ({
  onUrlSubmit,
  disabled = false,
}) => {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const { toast } = useToast();

  const toggleUrlInput = () => {
    setShowUrlInput(!showUrlInput);
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlInput(e.target.value);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const submitUrl = () => {
    if (!urlInput.trim() || disabled) return;
    
    // Simple URL validation
    if (!isValidUrl(urlInput)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    onUrlSubmit(urlInput);
    setUrlInput('');
    setShowUrlInput(false);
  };

  if (showUrlInput) {
    return (
      <div className="mb-2 relative border border-input rounded-lg shadow-sm">
        <input
          type="text"
          value={urlInput}
          onChange={handleUrlInputChange}
          placeholder="Paste vehicle listing URL here..."
          className="w-full py-3 px-3 rounded-lg"
          disabled={disabled}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            disabled={disabled}
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={submitUrl}
            className={`p-2 rounded-full ${
              urlInput.trim() && !disabled
                ? 'bg-carfix-600 text-white hover:bg-carfix-700'
                : 'bg-muted text-muted-foreground'
            } transition-colors`}
            disabled={!urlInput.trim() || disabled}
            aria-label="Analyze URL"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleUrlInput}
      className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
      disabled={disabled}
      aria-label="Analyze vehicle listing"
      title="Analyze vehicle listing URL"
    >
      <Link className="h-5 w-5" />
    </button>
  );
};

export default UrlAnalyzer;
