
import React from 'react';

interface ComponentDiagramExtractorProps {
  content: string;
}

const ComponentDiagramExtractor: React.FC<ComponentDiagramExtractorProps> = ({ content }) => {
  const extractComponentDiagram = (text: string) => {
    const diagramRegex = /{COMPONENT_DIAGRAM:\s*({.*?})}/s;
    const match = text.match(diagramRegex);
    
    if (match && match[1]) {
      try {
        const diagramData = JSON.parse(match[1]);
        return {
          componentName: diagramData.componentName || '',
          location: diagramData.location || '',
          diagramUrl: diagramData.diagramUrl || ''
        };
      } catch (error) {
        console.error('Error parsing component diagram data:', error);
        return null;
      }
    }
    return null;
  };
  
  return extractComponentDiagram(content);
};

export default ComponentDiagramExtractor;
