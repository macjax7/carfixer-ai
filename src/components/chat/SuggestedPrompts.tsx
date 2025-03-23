
import React, { useState, useRef, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AutoplayPlugin from 'embla-carousel-autoplay';

interface SuggestedPromptsProps {
  handleSuggestedPrompt: (prompt: string) => void;
  prompts: string[];
}

const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ 
  handleSuggestedPrompt, 
  prompts 
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isLeftArrowHovering, setIsLeftArrowHovering] = useState(false);
  const [isRightArrowHovering, setIsRightArrowHovering] = useState(false);
  // Fix: Use 'any' type instead of trying to use AutoplayPlugin as a type
  const autoplayRef = useRef<any>(null);
  const [api, setApi] = useState<any>(null);
  
  // Configure autoplay plugin with slow default speed
  const autoplayOptions = {
    delay: 4000,
    stopOnInteraction: false,
    rootNode: (emblaRoot: any) => emblaRoot.parentElement,
  };
  
  // Effect to handle autoplay pause/resume based on hover state
  useEffect(() => {
    if (!api || !autoplayRef.current) return;
    
    if (isHovering) {
      autoplayRef.current.stop();
    } else {
      autoplayRef.current.reset();
      autoplayRef.current.play();
    }
  }, [isHovering, api]);
  
  // Effect to handle speed change based on arrow hover
  useEffect(() => {
    if (!api || !autoplayRef.current) return;
    
    // Default speed when not hovering arrows
    if (!isLeftArrowHovering && !isRightArrowHovering) {
      autoplayRef.current.options.delay = 4000;
      return;
    }
    
    // Speed up and set direction when hovering arrows
    if (isLeftArrowHovering) {
      autoplayRef.current.options.delay = 1000;
      api.scrollPrev();
    }
    
    if (isRightArrowHovering) {
      autoplayRef.current.options.delay = 1000;
      api.scrollNext();
    }
  }, [isLeftArrowHovering, isRightArrowHovering, api]);
  
  // Group prompts into two rows for more ChatGPT-like appearance
  const firstRow = prompts.slice(0, Math.ceil(prompts.length / 2));
  const secondRow = prompts.slice(Math.ceil(prompts.length / 2));
  
  return (
    <div className="flex flex-col gap-3 items-center justify-center w-full animate-fade-in">
      {/* Row 1 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {firstRow.map((prompt, index) => (
          <Button
            key={`row1-${index}`}
            onClick={() => handleSuggestedPrompt(prompt)}
            variant="outline"
            className="text-sm h-auto py-2 px-4 bg-secondary/50 hover:bg-secondary/80 text-foreground rounded-full transition-all duration-200 border border-border/30 hover:border-border/60 whitespace-nowrap"
          >
            {prompt}
          </Button>
        ))}
      </div>
      
      {/* Row 2 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {secondRow.map((prompt, index) => (
          <Button
            key={`row2-${index}`}
            onClick={() => handleSuggestedPrompt(prompt)}
            variant="outline"
            className="text-sm h-auto py-2 px-4 bg-secondary/50 hover:bg-secondary/80 text-foreground rounded-full transition-all duration-200 border border-border/30 hover:border-border/60 whitespace-nowrap"
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedPrompts;
