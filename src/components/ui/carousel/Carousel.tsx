
import * as React from "react"
import { cn } from "@/lib/utils"
import { CarouselProvider } from "./CarouselContext"
import type { CarouselOptions, CarouselPlugin, CarouselApi } from "./useCarousel"
import { useCarousel } from "./useCarousel"

export interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <CarouselProvider
        orientation={orientation}
        opts={opts}
        setApi={setApi}
        plugins={plugins}
      >
        <div
          ref={ref}
          onKeyDownCapture={(e) => {
            const { handleKeyDown } = useCarousel();
            handleKeyDown?.(e);
          }}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselProvider>
    )
  }
)
Carousel.displayName = "Carousel"

export { Carousel }
