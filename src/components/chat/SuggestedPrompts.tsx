
import React from 'react';
import { LightbulbIcon } from 'lucide-react';

interface SuggestedPromptsProps {
  handleSuggestedPrompt: (prompt: string) => void;
  prompts: string[];
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ handleSuggestedPrompt, prompts }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-6">
      <h1 className="text-3xl font-bold text-foreground text-center bg-gradient-to-r from-carfix-500 to-carfix-700 bg-clip-text text-transparent">
        How can I help with your vehicle?
      </h1>
      
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleSuggestedPrompt(prompt)}
            className="text-sm px-4 py-3 bg-secondary/80 hover:bg-secondary rounded-xl text-left transition-colors duration-200 border border-border flex items-start"
          >
            <LightbulbIcon className="h-4 w-4 mr-2 text-carfix-500 flex-shrink-0 mt-0.5" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
