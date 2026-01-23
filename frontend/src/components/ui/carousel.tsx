import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "../../lib/utils"

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
}

export function Carousel({ children, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const childrenArray = React.Children.toArray(children);
  const totalSlides = childrenArray.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (totalSlides === 0) {
    return null;
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {childrenArray.map((child, index) => (
            <div key={index} className="min-w-full max-w-full flex-shrink-0 flex-grow-0 w-full">
              {child}
            </div>
          ))}
        </div>
      </div>

      {totalSlides > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {childrenArray.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-white/50 hover:bg-white/80"
                )}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

