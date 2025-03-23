
import * as React from "react"
import type { UseEmblaCarouselType } from "embla-carousel-react"

export type CarouselApi = UseEmblaCarouselType[1]
export type UseCarouselParameters = Parameters<typeof import("embla-carousel-react").default>
export type CarouselOptions = UseCarouselParameters[0]
export type CarouselPlugin = UseCarouselParameters[1]

export interface CarouselContextProps {
  carouselRef: React.RefObject<HTMLDivElement> | any // Using any to accommodate EmblaViewportRefType
  api: CarouselApi
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  orientation?: "horizontal" | "vertical"
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  setApi?: (api: CarouselApi) => void
  handleKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void
}

export const useCarousel = () => {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

// Define the context here to avoid circular dependencies
// The actual context is initialized in CarouselContext.tsx
export const CarouselContext = React.createContext<CarouselContextProps | null>(null)
