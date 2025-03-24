
import React from 'react';
import { ExternalLink, Play } from 'lucide-react';
import { VideoRecommendation } from './types';

interface VideoCardProps {
  video: VideoRecommendation;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { title, url, thumbnailUrl } = video;
  
  // Extract video ID from YouTube URL for thumbnail if not provided
  const getYouTubeVideoId = (youtubeUrl: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = youtubeUrl.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const videoId = thumbnailUrl ? '' : getYouTubeVideoId(url);
  const defaultThumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
  
  const actualThumbnailUrl = thumbnailUrl || defaultThumbnailUrl || "/placeholder.svg";

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block mb-3 rounded-lg overflow-hidden border border-gray-200 hover:border-carfix-500 transition-colors bg-background/50"
    >
      <div className="relative">
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          <img 
            src={actualThumbnailUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="bg-carfix-600 rounded-full p-2">
              <Play className="h-6 w-6 text-white" fill="white" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-medium line-clamp-2">{title}</h3>
          <ExternalLink className="h-4 w-4 text-gray-500 flex-shrink-0 ml-2 mt-0.5" />
        </div>
        <p className="text-xs text-gray-500 mt-1">YouTube Video</p>
      </div>
    </a>
  );
};

export default VideoCard;
