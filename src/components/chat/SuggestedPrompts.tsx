
import React from 'react';

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleSuggestedPrompt(prompt)}
            className="text-sm px-3 py-2 bg-secondary/50 hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-full text-left transition-all duration-200 border border-border/30 hover:border-border/60"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
