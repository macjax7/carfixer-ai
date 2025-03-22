
export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  image?: string;
  componentDiagram?: {
    componentName: string;
    location: string;
    diagramUrl: string;
  };
}
