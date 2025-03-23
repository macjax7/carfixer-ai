
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
  id: number | string;
  title: string;
  timestamp: string;
  path: string;
}

export interface SearchResults {
  projects: Project[];
  chats: ChatHistoryItem[];
}

export interface ProjectState {
  [key: string]: boolean;
}
