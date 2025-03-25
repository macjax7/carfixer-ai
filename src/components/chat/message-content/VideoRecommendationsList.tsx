
import React from 'react';
import VideoCard from '../VideoCard';
import { VideoRecommendation } from '../types';

interface VideoRecommendationsListProps {
  videos: VideoRecommendation[];
}

const VideoRecommendationsList: React.FC<VideoRecommendationsListProps> = ({ videos }) => {
  if (!videos || videos.length === 0) return null;
  
  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {videos.length > 1 ? 'Recommended Videos' : 'Recommended Video'}
      </h3>
      <div className="space-y-3">
        {videos.map((video, index) => (
          <VideoCard key={index} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoRecommendationsList;
