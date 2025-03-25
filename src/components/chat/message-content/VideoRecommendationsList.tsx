
import React from 'react';
import VideoCard from '../VideoCard';

interface VideoRecommendationsListProps {
  videos: Array<{
    title: string;
    url: string;
    thumbnailUrl?: string;
  }>;
}

const VideoRecommendationsList: React.FC<VideoRecommendationsListProps> = ({ videos }) => {
  if (!videos || videos.length === 0) return null;
  
  return (
    <div className="mt-3 space-y-2">
      {videos.map((video, index) => (
        <VideoCard key={index} video={video} />
      ))}
    </div>
  );
};

export default VideoRecommendationsList;
