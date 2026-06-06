import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoChevronBackOutline, IoChevronForwardOutline, IoCloseOutline } from "react-icons/io5";

const Lightbox = ({ isOpen, images, startIndex = 0, onClose }) => {
  const list = useMemo(() => {
    const raw = Array.isArray(images) ? images.filter(Boolean) : [];
    return raw
      .map((img) => {
        if (!img) return null;
        if (typeof img === "string") return { src: img };
        if (typeof img === "object") {
          const src = img.src || img.url || img.image || "";
          if (!src) return null;
          return { src, href: img.href || img.link || img.projectUrl || "" };
        }
        return null;
      })
      .filter(Boolean);
  }, [images]);
  const [index, setIndex] = useState(startIndex);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setIndex(startIndex);
  }, [isOpen, startIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, index, list.length]);

  const clamp = (i) => {
    if (!list.length) return 0;
    return (i + list.length) % list.length;
  };
  const prev = () => setIndex((i) => clamp(i - 1));
  const next = () => setIndex((i) => clamp(i + 1));

  const onTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (e) => {
    const start = touchStartX.current;
    const end = e.changedTouches?.[0]?.clientX ?? null;
    touchStartX.current = null;
    if (start === null || end === null) return;
    const dx = end - start;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) prev();
    else next();
  };

  if (!isOpen) return null;
  const current = list[index];
  if (!current?.src) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgb(var(--color-ink-rgb)/0.9)] p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="relative w-full max-w-5xl">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 inline-flex cursor-pointer items-center gap-2 border-2 border-[var(--color-paper-light)] bg-[var(--color-accent)] p-1 text-[var(--color-ink)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
          aria-label="Close"
        >
          <IoCloseOutline size={26} />
        </button>

        <div
          className="relative w-full overflow-hidden border-2 border-[var(--color-paper-light)] bg-[var(--color-ink)] shadow-[8px_8px_0_var(--color-accent)]"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <img src={current.src} alt={`Image ${index + 1}`} className="max-h-[78vh] w-full bg-[var(--color-ink)] object-contain" />

          {list.length > 1 ? (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-accent)] transition hover:bg-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                aria-label="Previous image"
              >
                <IoChevronBackOutline size={22} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-accent)] transition hover:bg-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                aria-label="Next image"
              >
                <IoChevronForwardOutline size={22} />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] px-3 py-1.5 text-xs font-black uppercase tracking-widest text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-accent)]">
                {index + 1} / {list.length}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
