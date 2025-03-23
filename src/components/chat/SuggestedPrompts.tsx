
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

interface SuggestedPromptsProps {
  handleSuggestedPrompt: (prompt: string) => void;
  prompts: string[];
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ handleSuggestedPrompt, prompts }) => {
  // Calculate how many prompts to show per view based on available width
  // Will show 3 on mobile, 4 on larger screens
  const promptsPerView = {
    mobile: 1,    // 1 prompt on very small screens
    tablet: 2,    // 2 prompts on small/medium screens
    desktop: 3,   // 3 prompts on larger screens
  };
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 space-y-8 w-full">
      <h1 className="text-3xl font-bold text-foreground text-center bg-gradient-to-r from-carfix-500 to-carfix-700 bg-clip-text text-transparent">
        How can I help with your vehicle?
      </h1>
      
      <div className="w-full max-w-xl">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {prompts.map((prompt, index) => (
              <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
                <Button
                  onClick={() => handleSuggestedPrompt(prompt)}
                  variant="outline"
                  className="text-sm h-auto py-2 w-full bg-secondary/50 hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-full text-left transition-all duration-200 border border-border/30 hover:border-border/60"
                >
                  {prompt}
                </Button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4 gap-2">
            <CarouselPrevious className="relative inset-0 translate-y-0 left-0" />
            <CarouselNext className="relative inset-0 translate-y-0 right-0" />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default SuggestedPrompts;
