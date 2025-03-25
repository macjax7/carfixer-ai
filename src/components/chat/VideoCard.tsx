
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface VideoCardProps {
  video: {
    title: string;
    url: string;
    thumbnailUrl?: string;
  };
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  // Extract YouTube video ID from URL for thumbnail if not provided
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = video.thumbnailUrl ? undefined : getYouTubeVideoId(video.url);
  const thumbnailUrl = video.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined);

  return (
    <a 
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-background/80 border border-border rounded-md overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="flex items-center p-2">
        {thumbnailUrl && (
          <div className="w-24 h-16 mr-3 overflow-hidden rounded bg-muted flex-shrink-0">
            <img 
              src={thumbnailUrl} 
              alt={video.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium leading-tight line-clamp-2">{video.title}</h4>
          <div className="mt-1 flex items-center text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3 mr-1" />
            <span className="truncate">Watch on YouTube</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default VideoCard;
