
import React from 'react';
import { MessageContentProps, VideoRecommendation } from './types';
import RepairInstructions from './RepairInstructions';
import ComponentDiagram from './ComponentDiagram';
import TextWithLinks from './message-content/TextWithLinks';
import { extractComponentDiagram } from './message-content/ComponentDiagramExtractor';
import { cleanText, containsStructuredRepairGuide } from './message-content/MessageUtils';
import VideoRecommendationsList from './message-content/VideoRecommendationsList';
import UploadedImage from './message-content/UploadedImage';
import YouTubeExtractor from './message-content/YouTubeExtractor';

const MessageContent: React.FC<MessageContentProps> = ({
  text,
  image,
  sender,
  videoRecommendations,
  repairGuidance
}) => {
  console.log("MessageContent received text:", text?.substring(0, 100) + "...");
  console.log("Sender:", sender);
  
  // Extract component diagram data using the utility function
  const componentDiagram = extractComponentDiagram(text);
  
  // Clean the text to remove diagram markers
  const cleanedText = cleanText(text);
  console.log("Text after cleaning:", cleanedText?.substring(0, 100) + "...");

  // Extract YouTube links from markdown
  const markdownVideos = YouTubeExtractor({ text: cleanedText });
  console.log("Extracted videos from markdown:", markdownVideos.length);
  
  // Combine explicitly passed videos with those extracted from markdown
  const allVideoRecommendations: VideoRecommendation[] = [
    ...(videoRecommendations || []),
    ...markdownVideos
  ];

  // Check if content contains structured repair instructions
  const hasStructuredGuide = containsStructuredRepairGuide(
    cleanedText, 
    repairGuidance?.format
  );
  console.log("Has structured repair guide:", hasStructuredGuide);
  
  // Log component diagram details if present
  if (componentDiagram) {
    console.log("Component diagram found:", {
      componentName: componentDiagram.componentName,
      location: componentDiagram.location,
      hasDiagramUrl: !!componentDiagram.diagramUrl,
      hasHighlightedUrl: !!componentDiagram.highlightedDiagramUrl
    });
  }
  
  // Break content into sections for better presentation
  const identifySections = (content: string) => {
    // Check for common section markers
    const simplifiedSection = content.match(/In Simple Terms:(.+?)(?=\n\n|Technical Explanation:|$)/is);
    const technicalSection = content.match(/Technical Explanation:(.+?)(?=\n\n|What to Check:|Steps to:|$)/is);
    
    if (simplifiedSection || technicalSection) {
      console.log("Identified content sections for enhanced display");
    }
    
    return { hasContentSections: !!(simplifiedSection || technicalSection) };
  };
  
  const { hasContentSections } = identifySections(cleanedText);
  
  return (
    <>
      {/* Display uploaded image if present */}
      {image && <UploadedImage src={image} />}
      
      {/* Standard text message (hidden if it's a structured repair guide) */}
      {(!hasStructuredGuide || sender === 'user') && (
        <div className={`${sender === 'ai' ? 'text-sm md:text-base whitespace-pre-wrap' : ''}`}>
          <TextWithLinks content={cleanedText} sender={sender} />
        </div>
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
          highlightedDiagramUrl={componentDiagram.highlightedDiagramUrl}
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
