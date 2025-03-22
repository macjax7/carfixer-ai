
import React from 'react';
import { Map } from 'lucide-react';

interface ComponentDiagramProps {
  componentDiagram: {
    componentName: string;
    location: string;
    diagramUrl: string;
  };
}

const ComponentDiagram: React.FC<ComponentDiagramProps> = ({ componentDiagram }) => {
  return (
    <div className="mt-4 border border-border/60 rounded-lg p-3 bg-background/50">
      <div className="flex items-center gap-2 mb-2 text-carfix-600">
        <Map className="h-4 w-4" />
        <h4 className="font-medium">{componentDiagram.componentName} Location</h4>
      </div>
      <p className="text-sm mb-2 text-muted-foreground">{componentDiagram.location}</p>
      <div className="rounded-md overflow-hidden border border-border/60">
        <img 
          src={componentDiagram.diagramUrl} 
          alt={`${componentDiagram.componentName} location`}
          className="w-full object-contain"
        />
      </div>
    </div>
  );
};

export default ComponentDiagram;
