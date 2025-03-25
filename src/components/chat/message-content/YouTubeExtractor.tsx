
import React from 'react';
import { VideoRecommendation } from '../types';

interface YouTubeExtractorProps {
  text: string;
}

// Function to extract YouTube links from plain text and markdown
export const extractVideoRecommendationsFromMarkdown = (content: string): VideoRecommendation[] => {
  // Array to store all video recommendations
  const recommendations: VideoRecommendation[] = [];
  
  // Match markdown-style links with YouTube URLs
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+[^\s)]*)\)/g;
  let match;
  
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    recommendations.push({
      title: match[1],
      url: match[2],
    });
  }
  
  // Match plain YouTube URLs that are not in Markdown format
  // This handles both youtube.com and youtu.be formats
  const plainYouTubeRegex = /(^|\s)(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+[^\s)]*)/g;
  
  while ((match = plainYouTubeRegex.exec(content)) !== null) {
    // Check if this URL is already captured in markdown format
    const url = match[2];
    if (!recommendations.some(rec => rec.url === url)) {
      // Extract video ID for title lookup
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      
      recommendations.push({
        title: videoId ? `YouTube Video (${videoId})` : 'YouTube Video',
        url: url,
      });
    }
  }
  
  return recommendations;
};

// Keep component for backwards compatibility
const YouTubeExtractor: React.FC<YouTubeExtractorProps> = ({ text }) => {
  return null;
};

// Default export returns the extracted video recommendations
export default function({ text }: YouTubeExtractorProps): VideoRecommendation[] {
  return extractVideoRecommendationsFromMarkdown(text);
}
