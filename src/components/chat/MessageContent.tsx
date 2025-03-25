
import React from 'react';
import { MessageContentProps } from './types';
import RepairInstructions from './RepairInstructions';
import ComponentDiagram from './ComponentDiagram';
import TextWithLinks from './message-content/TextWithLinks';
import ComponentDiagramExtractor from './message-content/ComponentDiagramExtractor';
import { cleanText, containsStructuredRepairGuide } from './message-content/MessageUtils';
import VideoRecommendationsList from './message-content/VideoRecommendationsList';
import UploadedImage from './message-content/UploadedImage';
import YouTubeExtractor from './message-content/YouTubeExtractor';

const MessageContent: React.FC<MessageContentProps & { 
  videoRecommendations?: any[];
  repairGuidance?: {
    content: string;
    format?: string;
  };
}> = ({
  text,
  image,
  sender,
  videoRecommendations,
  repairGuidance
}) => {
  // Extract component diagram data
  const componentDiagram = ComponentDiagramExtractor({ content: text });
  
  // Clean the text to remove diagram markers
  const cleanedText = cleanText(text);

  // Extract YouTube links from markdown
  const markdownVideos = YouTubeExtractor({ text: cleanedText });
  
  // Combine explicitly passed videos with those extracted from markdown
  const allVideoRecommendations = [
    ...(videoRecommendations || []),
    ...markdownVideos
  ];

  // Check if content contains structured repair instructions
  const hasStructuredGuide = containsStructuredRepairGuide(
    cleanedText, 
    repairGuidance?.format
  );
  
  return (
    <>
      {/* Display uploaded image if present */}
      <UploadedImage src={image} />
      
      {/* Standard text message (hidden if it's a structured repair guide) */}
      {(!hasStructuredGuide || sender === 'user') && (
        <p className="text-sm md:text-base whitespace-pre-wrap">
          <TextWithLinks content={cleanedText} sender={sender} />
        </p>
      )}
      
      {/* Structured repair instructions */}
      {sender === 'ai' && hasStructuredGuide && (
        <RepairInstructions 
          content={repairGuidance?.content || cleanedText} 
        />
      )}
      
      {/* Component diagram */}
      {componentDiagram && (
        <div className="mt-3 p-3 bg-background/90 border border-border/60 rounded-lg">
          <h4 className="text-sm font-medium mb-1 text-carfix-600">{componentDiagram.componentName} Location</h4>
          {componentDiagram.location && (
            <p className="text-xs text-muted-foreground mb-2">{componentDiagram.location}</p>
          )}
          <div className="rounded overflow-hidden border border-border/40">
            <img 
              src={componentDiagram.diagramUrl} 
              alt={`${componentDiagram.componentName} diagram`} 
              className="w-full object-contain max-h-60"
              onClick={() => window.open(componentDiagram.diagramUrl, '_blank')}
              style={{ cursor: 'zoom-in' }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">Click image to enlarge</p>
        </div>
      )}
      
      {/* Video recommendations */}
      <VideoRecommendationsList videos={allVideoRecommendations} />
    </>
  );
};

export default MessageContent;
