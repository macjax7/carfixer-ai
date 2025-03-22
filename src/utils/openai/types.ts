
/**
 * Types for OpenAI API interactions
 */
export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};
