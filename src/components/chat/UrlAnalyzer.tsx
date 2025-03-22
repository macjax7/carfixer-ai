
import React, { useState } from 'react';
import { Link, X, Send, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

  const isSupportedDomain = (url: string) => {
    const supportedDomains = [
      'craigslist.org',
      'facebook.com',
      'cargurus.com',
      'edmunds.com',
      'autotrader.com',
      'cars.com',
      'truecar.com',
      'carmax.com',
      'ebay.com',
      'marketplace.facebook.com',
      'fb.com',
      'kbb.com',
      'vroom.com',
      'carvana.com'
    ];
    
    try {
      const hostname = new URL(url).hostname;
      return supportedDomains.some(domain => hostname.includes(domain));
    } catch {
      return false;
    }
  };

  const getDomainRecommendation = (url: string) => {
    // Check which domain the URL is from
    try {
      const hostname = new URL(url).hostname.toLowerCase();
      
      // Provide specific recommendations based on the domain
      if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
        return "Facebook Marketplace links often require login. For best results, try AutoTrader or Cars.com instead.";
      }
      
      if (hostname.includes('craigslist.org')) {
        return "Craigslist links may have limited details. For more reliable analysis, try AutoTrader or Cars.com links.";
      }
      
      // Default message
      return "For best results, use vehicle listings from AutoTrader.com, Cars.com, or dealer websites.";
    } catch {
      return "For best results, use vehicle listings from AutoTrader.com, Cars.com, or dealer websites.";
    }
  };

  const submitUrl = () => {
    if (!urlInput.trim() || disabled) return;
    
    // URL validation
    if (!isValidUrl(urlInput)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    // Domain validation
    if (!isSupportedDomain(urlInput)) {
      toast({
        title: "Unsupported Website",
        description: "Please provide a URL from a supported vehicle listing platform (AutoTrader, Cars.com, CarGurus, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Show recommendation toast
    toast({
      title: "Analyzing Listing",
      description: getDomainRecommendation(urlInput),
      variant: "default"
    });
    
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
          className="w-full py-3 px-3 rounded-lg pr-20"
          disabled={disabled}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                  aria-label="Listing support info"
                >
                  <Info className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>For best results, use listings from AutoTrader.com or Cars.com. Some sites like Facebook Marketplace or Craigslist may have limited compatibility.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleUrlInput}
            className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
            disabled={disabled}
            aria-label="Analyze vehicle listing"
          >
            <Link className="h-5 w-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Analyze vehicle listing URL</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UrlAnalyzer;
