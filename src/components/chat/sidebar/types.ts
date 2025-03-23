
export interface ProjectSubItem {
  id: number;
  title: string;
  path: string;
}

export interface Project {
  id: number;
  title: string;
  path: string;
  subItems: ProjectSubItem[];
}

export interface ChatHistoryItem {
  id: number;
  title: string;
  timestamp: string;
  path: string;
}
