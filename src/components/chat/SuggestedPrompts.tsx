
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
  
  return (
    <div 
      className="w-full max-w-xl mx-auto animate-fade-in"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          AutoplayPlugin(autoplayOptions)
        ]}
        setApi={(carouselApi) => {
          setApi(carouselApi);
          if (carouselApi) {
            // Find and store the autoplay plugin instance
            const plugins = carouselApi.plugins();
            if (plugins.autoplay) {
              autoplayRef.current = plugins.autoplay;
            }
          }
        }}
        className="w-full"
      >
        <CarouselContent>
          {prompts.map((prompt, index) => (
            <CarouselItem key={index} className="basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 transition-all duration-300">
              <Button
                onClick={() => handleSuggestedPrompt(prompt)}
                variant="outline"
                className="text-sm h-auto py-2 px-4 w-full bg-secondary/50 hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-full text-left transition-all duration-200 border border-border/30 hover:border-border/60 hover:shadow-sm"
              >
                {prompt}
              </Button>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-4 gap-2">
          <CarouselPrevious 
            className={cn(
              "relative inset-0 translate-y-0 left-0 h-8 w-8 rounded-full opacity-70 hover:opacity-100 transition-opacity",
              isLeftArrowHovering ? "bg-secondary/80" : "bg-secondary/50"
            )}
            onMouseEnter={() => setIsLeftArrowHovering(true)}
            onMouseLeave={() => setIsLeftArrowHovering(false)}
            icon={ChevronLeft}
          />
          <CarouselNext 
            className={cn(
              "relative inset-0 translate-y-0 right-0 h-8 w-8 rounded-full opacity-70 hover:opacity-100 transition-opacity",
              isRightArrowHovering ? "bg-secondary/80" : "bg-secondary/50"
            )}
            onMouseEnter={() => setIsRightArrowHovering(true)}
            onMouseLeave={() => setIsRightArrowHovering(false)}
            icon={ChevronRight}
          />
        </div>
      </Carousel>
    </div>
  );
};

export default SuggestedPrompts;
