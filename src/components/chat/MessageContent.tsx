
import React from 'react';
import { MessageContentProps } from './types';
import RepairInstructions from './RepairInstructions';
import ComponentDiagram from './ComponentDiagram';
import TextWithLinks from './message-content/TextWithLinks';
import { extractComponentDiagram } from './message-content/ComponentDiagramExtractor';
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
  // Extract component diagram data using the utility function
  const componentDiagram = extractComponentDiagram(text);
  
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
      {image && <UploadedImage src={image} />}
      
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
        <ComponentDiagram 
          componentName={componentDiagram.componentName}
          location={componentDiagram.location}
          diagramUrl={componentDiagram.diagramUrl}
        />
      )}
      
      {/* Video recommendations */}
      {allVideoRecommendations.length > 0 && (
        <VideoRecommendationsList videos={allVideoRecommendations} />
      )}
    </>
  );
};

export default MessageContent;
