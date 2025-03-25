
export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  image?: string;
  componentDiagram?: ComponentDiagram;
  vehicleListingAnalysis?: VehicleListingAnalysis;
  videoRecommendations?: VideoRecommendation[];
  repairGuidance?: RepairGuidance;
}

export interface ComponentDiagram {
  componentName: string;
  location: string;
  diagramUrl: string;
}

export interface VehicleListingAnalysis {
  url: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  price?: number;
  vin?: string;
  description?: string;
  imageUrl?: string;
  analysis: {
    reliability: string;
    marketValue: string;
    maintenanceNeeds: string;
    redFlags: string;
    recommendation: string;
  };
}

export interface VideoRecommendation {
  title: string;
  url: string;
  thumbnailUrl?: string;
}

export interface RepairGuidance {
  content: string;
  format?: string;
}

export interface MessageContentProps {
  text: string;
  image?: string;
  sender: 'user' | 'ai';
  videoRecommendations?: VideoRecommendation[];
  repairGuidance?: RepairGuidance;
}
