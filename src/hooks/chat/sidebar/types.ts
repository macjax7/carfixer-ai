export interface ProjectSubItem {
  id: number | string;
  title: string;
  path: string;
}

export interface Project {
  id: number | string;
  title: string;
  path: string;
  subItems: ProjectSubItem[];
}

export interface ChatHistoryItem {
  id: string | number;
  title: string;
  timestamp: string;
  path: string;
  updated_at?: string;
}

export interface SearchResults {
  projects: Project[];
  chats: ChatHistoryItem[];
}

export interface ProjectState {
  [key: string]: boolean;
}
