
import React from 'react';
import { MessageContentProps } from './types';
import VideoCard from './VideoCard';
import DiagnosticResponse from './DiagnosticResponse';
import { useCodeDetection } from '@/hooks/chat/useCodeDetection';

const MessageContent: React.FC<MessageContentProps & { videoRecommendations?: any[] }> = ({
  text,
  image,
  sender,
  videoRecommendations
}) => {
  const { extractDTCCodes, containsDTCCode, containsNoStartSymptoms, containsPerformanceSymptoms } = useCodeDetection();
  
  // Determine if this is a diagnostic response for special formatting
  const isDiagnosticResponse = 
    sender === 'ai' && 
    (containsDTCCode(text) || 
     containsNoStartSymptoms(text) || 
     containsPerformanceSymptoms(text));
  
  // Extract DTC code if present
  const dtcCodes = containsDTCCode(text) ? extractDTCCodes(text) : [];
  const primaryDtcCode = dtcCodes.length > 0 ? dtcCodes[0] : undefined;

  // Enhanced URL regex that matches more URL formats, specifically targeting vehicle listing platforms and YouTube
  const renderTextWithLinks = (content: string) => {
    // Enhanced URL regex that matches more URL formats
    const urlRegex = /(https?:\/\/[^\s<]+[^<,.:\s])/g;
    
    // Extract any YouTube links from the text to display as video cards
    const extractYouTubeLinks = (text: string) => {
      const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
      const matches = [];
      let match;
      
      while ((match = youtubeRegex.exec(text)) !== null) {
        matches.push({
          url: match[0],
          videoId: match[1],
        });
      }
      
      return matches;
    };
    
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
    
    // Extract YouTube links for later conversion to video cards
    const youtubeLinks = extractYouTubeLinks(content);
    
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
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
    });
  };

  // Function to extract YouTube links from markdown formatted links
  const extractVideoRecommendationsFromMarkdown = (text: string) => {
    // Look for markdown links with YouTube URLs
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+[^\s)]*)\)/g;
    const recommendations = [];
    let match;
    
    while ((match = markdownLinkRegex.exec(text)) !== null) {
      recommendations.push({
        title: match[1],
        url: match[2],
      });
    }
    
    return recommendations;
  };

  // Combine any explicitly passed video recommendations with those extracted from markdown links
  const allVideoRecommendations = [
    ...(videoRecommendations || []),
    ...extractVideoRecommendationsFromMarkdown(text)
  ];

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
      
      {/* Use DiagnosticResponse component for diagnostic content */}
      {isDiagnosticResponse ? (
        <DiagnosticResponse 
          text={text}
          sender={sender}
          dtcCode={primaryDtcCode}
        />
      ) : (
        <p className="text-sm md:text-base whitespace-pre-wrap">
          {renderTextWithLinks(text)}
        </p>
      )}
      
      {allVideoRecommendations.length > 0 && (
        <div className="mt-3 space-y-2">
          {allVideoRecommendations.map((video, index) => (
            <VideoCard key={index} video={video} />
          ))}
        </div>
      )}
    </>
  );
};

export default MessageContent;
