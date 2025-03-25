
import React, { useState } from 'react';
import { Map, ZoomIn } from 'lucide-react';
import { ComponentDiagram as ComponentDiagramType } from './types';

interface ComponentDiagramProps {
  componentName: string;
  location: string;
  diagramUrl: string;
  highlightedDiagramUrl?: string;
}

const ComponentDiagram: React.FC<ComponentDiagramProps> = ({ 
  componentName, 
  location, 
  diagramUrl,
  highlightedDiagramUrl
}) => {
  const [showHighlighted, setShowHighlighted] = useState(true);
  
  // Add safety checks for the props
  if (!componentName || !location || !diagramUrl) {
    console.error('Missing required props in ComponentDiagram', { componentName, location, diagramUrl });
    return null; // Don't render if missing required props
  }
  
  // Use highlighted diagram if available, otherwise use regular diagram
  const displayUrl = showHighlighted && highlightedDiagramUrl ? highlightedDiagramUrl : diagramUrl;
  
  const toggleView = () => {
    if (highlightedDiagramUrl) {
      setShowHighlighted(!showHighlighted);
    }
  };
  
  return (
    <div className="mt-4 border border-border/60 rounded-lg p-3 bg-background/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-carfix-600">
          <Map className="h-4 w-4" />
          <h4 className="font-medium">{componentName} Location</h4>
        </div>
        
        {highlightedDiagramUrl && (
          <button 
            onClick={toggleView}
            className="text-xs text-muted-foreground hover:text-carfix-600 transition-colors"
          >
            {showHighlighted ? "Show Original" : "Show Highlighted"}
          </button>
        )}
      </div>
      
      <p className="text-sm mb-2 text-muted-foreground">{location}</p>
      
      <div className="rounded-md overflow-hidden border border-border/60 relative">
        <img 
          src={displayUrl} 
          alt={`${componentName} location${showHighlighted ? ' (highlighted)' : ''}`}
          className="w-full object-contain"
          onClick={() => window.open(displayUrl, '_blank')}
          style={{ cursor: 'zoom-in' }}
        />
        <div className="absolute bottom-2 right-2 bg-black/50 text-white rounded-full p-1">
          <ZoomIn size={16} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">Click image to enlarge</p>
    </div>
  );
};

export default ComponentDiagram;
