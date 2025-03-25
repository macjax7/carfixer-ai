
import React from 'react';

interface YouTubeExtractorProps {
  text: string;
}

const YouTubeExtractor: React.FC<YouTubeExtractorProps> = ({ text }) => {
  // Function to extract YouTube links from markdown formatted links
  const extractVideoRecommendationsFromMarkdown = (content: string) => {
    // Look for markdown links with YouTube URLs
    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+[^\s)]*)\)/g;
    const recommendations = [];
    let match;
    
    while ((match = markdownLinkRegex.exec(content)) !== null) {
      recommendations.push({
        title: match[1],
        url: match[2],
      });
    }
    
    return recommendations;
  };

  return extractVideoRecommendationsFromMarkdown(text);
};

export default YouTubeExtractor;
