
import React, { useState } from 'react';
import { ExternalLink, Play } from 'lucide-react';

interface VideoCardProps {
  video: {
    title: string;
    url: string;
    thumbnailUrl?: string;
  };
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [isEmbedMode, setIsEmbedMode] = useState(false);
  
  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(video.url);
  const thumbnailUrl = video.thumbnailUrl || (videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : undefined);
  
  const toggleEmbedMode = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsEmbedMode(!isEmbedMode);
  };

  return (
    <div className="bg-background/80 border border-border rounded-md overflow-hidden hover:shadow-md transition-shadow mb-3">
      {isEmbedMode && videoId ? (
        <div className="relative pb-[56.25%] h-0">
          <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      ) : (
        <a 
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
          onClick={toggleEmbedMode}
        >
          <div className="flex items-center p-2">
            {thumbnailUrl && (
              <div className="w-24 h-16 mr-3 overflow-hidden rounded bg-muted flex-shrink-0 relative group">
                <img 
                  src={thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium leading-tight line-clamp-2">{video.title}</h4>
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <ExternalLink className="w-3 h-3 mr-1" />
                <span className="truncate">Click to watch</span>
              </div>
            </div>
          </div>
        </a>
      )}
      
      {isEmbedMode && (
        <div className="p-2 text-center border-t border-border/50">
          <button 
            onClick={() => setIsEmbedMode(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Close embed
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoCard;
