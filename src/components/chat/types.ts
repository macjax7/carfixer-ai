
export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
