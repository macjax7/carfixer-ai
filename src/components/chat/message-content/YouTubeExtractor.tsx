import React from 'react';
import { VideoRecommendation } from '../types';

interface YouTubeExtractorProps {
  text: string;
}

// Function to extract YouTube links from markdown formatted links
export const extractVideoRecommendationsFromMarkdown = (content: string): VideoRecommendation[] => {
  // Look for markdown links with YouTube URLs
  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+[^\s)]*)\)/g;
  const recommendations: VideoRecommendation[] = [];
  let match;
  
  while ((match = markdownLinkRegex.exec(content)) !== null) {
    recommendations.push({
      title: match[1],
      url: match[2],
    });
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
