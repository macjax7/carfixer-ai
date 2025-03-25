
import React from 'react';
import { ComponentDiagram } from '../types';

interface ComponentDiagramExtractorProps {
  content: string;
}

export const extractComponentDiagram = (text: string): ComponentDiagram | null => {
  // Log the input text to check if diagram markers are present
  console.log("Extracting component diagram from text:", text.substring(0, 200) + "...");
  
  const diagramRegex = /{COMPONENT_DIAGRAM:\s*({.*?})}/s;
  const match = text.match(diagramRegex);
  
  if (match && match[1]) {
    console.log("Found component diagram marker in text, raw match:", match[1]);
    try {
      const diagramData = JSON.parse(match[1]);
      console.log("Successfully parsed component diagram data:", diagramData);
      
      // Validate required fields
      if (!diagramData.componentName || !diagramData.location || !diagramData.diagramUrl) {
        console.error('Missing required fields in component diagram data:', diagramData);
        return null;
      }
      
      return {
        componentName: diagramData.componentName,
        location: diagramData.location,
        diagramUrl: diagramData.diagramUrl,
        highlightedDiagramUrl: diagramData.highlightedDiagramUrl || '' // Support highlighted version
      };
    } catch (error) {
      console.error('Error parsing component diagram data:', error);
      return null;
    }
  }
  console.log("No component diagram marker found in text");
  return null;
};

const ComponentDiagramExtractor: React.FC<ComponentDiagramExtractorProps> = ({ content }) => {
  // This component doesn't render anything, it's just a utility
  return null;
};

export default ComponentDiagramExtractor;
