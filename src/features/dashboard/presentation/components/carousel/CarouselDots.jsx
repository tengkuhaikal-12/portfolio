const CarouselDots = ({ count, activeIndex, onSelect, label, className = "" }) => {
  if (!count) return null;

  return (
    <div className={`flex shrink-0 justify-center gap-2 pt-1 ${className}`} aria-label={`${label} slide dots`}>
      {Array.from({ length: count }).map((_, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`h-3 w-3 touch-manipulation border-2 border-[#151513] transition hover:scale-110 active:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5a36] focus-visible:ring-offset-2 ${isActive ? "bg-[#ff5a36]" : "bg-[#fbf8f0]"}`}
            aria-label={`Show ${label} slide ${index + 1}`}
            aria-current={isActive ? "true" : undefined}
          />
        );
      })}
    </div>
  );
};

export default CarouselDots;
