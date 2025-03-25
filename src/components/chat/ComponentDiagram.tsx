
import React from 'react';
import { Map } from 'lucide-react';
import { ComponentDiagram as ComponentDiagramType } from './types';

interface ComponentDiagramProps {
  componentName: string;
  location: string;
  diagramUrl: string;
}

const ComponentDiagram: React.FC<ComponentDiagramProps> = ({ 
  componentName, 
  location, 
  diagramUrl 
}) => {
  return (
    <div className="mt-4 border border-border/60 rounded-lg p-3 bg-background/50">
      <div className="flex items-center gap-2 mb-2 text-carfix-600">
        <Map className="h-4 w-4" />
        <h4 className="font-medium">{componentName} Location</h4>
      </div>
      <p className="text-sm mb-2 text-muted-foreground">{location}</p>
      <div className="rounded-md overflow-hidden border border-border/60">
        <img 
          src={diagramUrl} 
          alt={`${componentName} location`}
          className="w-full object-contain"
          onClick={() => window.open(diagramUrl, '_blank')}
          style={{ cursor: 'zoom-in' }}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1 text-center">Click image to enlarge</p>
    </div>
  );
};

export default ComponentDiagram;
