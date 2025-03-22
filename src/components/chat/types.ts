
export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  image?: string; // URL or base64 string for image attachment
}
