import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";

const CarouselControls = ({ onPrevious, onNext, disabled = false, label, className = "" }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <button
      type="button"
      onClick={onPrevious}
      disabled={disabled}
      className={`grid h-11 w-11 touch-manipulation place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[4px_4px_0_var(--color-ink)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${disabled ? "cursor-not-allowed opacity-50" : "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none"}`}
      aria-label={`Previous ${label} entry`}
    >
      <IoArrowBackOutline size={20} />
    </button>
    <button
      type="button"
      onClick={onNext}
      disabled={disabled}
      className={`grid h-11 w-11 touch-manipulation place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-accent)] text-[var(--color-ink)] shadow-[4px_4px_0_var(--color-ink)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${disabled ? "cursor-not-allowed opacity-50" : "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none"}`}
      aria-label={`Next ${label} entry`}
    >
      <IoArrowForwardOutline size={20} />
    </button>
  </div>
);

export default CarouselControls;
