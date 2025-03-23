
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
  const autoplayRef = useRef<any>(null);
  const [api, setApi] = useState<any>(null);
  
  // Configure autoplay plugin with slow default speed
  const autoplayOptions = {
    delay: 4000,
    stopOnInteraction: false,
    rootNode: (emblaRoot: any) => emblaRoot.parentElement,
  };
  
  // Initialize the autoplay plugin
  const autoplay = AutoplayPlugin(autoplayOptions);
  
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
  
  // Store a reference to the autoplay plugin when carousel is initialized
  useEffect(() => {
    if (api) {
      const plugins = api.plugins();
      // Find the autoplay plugin instance
      autoplayRef.current = plugins.autoplay;
    }
  }, [api]);
  
  return (
    <div 
      className="flex flex-col gap-3 items-center justify-center w-full animate-fade-in"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[autoplay]}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        setApi={setApi}
        className="w-full max-w-md relative"
      >
        <CarouselContent className="py-2">
          {prompts.map((prompt, index) => (
            <CarouselItem key={index} className="basis-auto">
              <Button
                onClick={() => handleSuggestedPrompt(prompt)}
                variant="outline"
                className="text-sm h-auto py-2 px-4 bg-secondary/50 hover:bg-secondary/80 text-foreground rounded-full transition-all duration-200 border border-border/30 hover:border-border/60 whitespace-nowrap"
              >
                {prompt}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div 
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center rounded-full transition-opacity duration-200",
            !isHovering && "opacity-0", 
            isHovering && "opacity-100 cursor-pointer",
            isLeftArrowHovering && "bg-secondary/70"
          )}
          onMouseEnter={() => setIsLeftArrowHovering(true)}
          onMouseLeave={() => setIsLeftArrowHovering(false)}
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeft className="h-5 w-5" />
        </div>
        
        <div 
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center rounded-full transition-opacity duration-200",
            !isHovering && "opacity-0", 
            isHovering && "opacity-100 cursor-pointer",
            isRightArrowHovering && "bg-secondary/70"
          )}
          onMouseEnter={() => setIsRightArrowHovering(true)}
          onMouseLeave={() => setIsRightArrowHovering(false)}
          onClick={() => api?.scrollNext()}
        >
          <ChevronRight className="h-5 w-5" />
        </div>
      </Carousel>
    </div>
  );
};

export default SuggestedPrompts;
