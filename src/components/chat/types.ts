
export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  image?: string;
  componentDiagram?: ComponentDiagram;
  vehicleListingAnalysis?: VehicleListingAnalysis;
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
