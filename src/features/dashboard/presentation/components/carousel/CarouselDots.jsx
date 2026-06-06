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
            className={`h-3 w-3 touch-manipulation border-2 border-[var(--color-ink)] transition hover:scale-110 active:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 ${isActive ? "bg-[var(--color-accent)]" : "bg-[var(--color-paper-light)]"}`}
            aria-label={`Show ${label} slide ${index + 1}`}
            aria-current={isActive ? "true" : undefined}
          />
        );
      })}
    </div>
  );
};

export default CarouselDots;
