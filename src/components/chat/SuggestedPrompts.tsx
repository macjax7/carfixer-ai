
import React from 'react';
import { LightbulbIcon } from 'lucide-react';

interface SuggestedPromptsProps {
  handleSuggestedPrompt: (prompt: string) => void;
  prompts: string[];
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ handleSuggestedPrompt, prompts }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-8">
      <h1 className="text-3xl font-bold text-foreground text-center bg-gradient-to-r from-carfix-500 to-carfix-700 bg-clip-text text-transparent">
        How can I help with your vehicle?
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleSuggestedPrompt(prompt)}
            className="suggested-prompt-box border border-border/60 shadow-sm hover:border-border/90 hover:shadow-md transition-all"
          >
            <LightbulbIcon className="h-5 w-5 mr-3 text-carfix-500 flex-shrink-0 mt-0.5" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
