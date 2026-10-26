
import { useCallback, useEffect, useRef, useState } from "react";

const normalizeIndex = (index, length) => {
  if (!length) return 0;
  return ((index % length) + length) % length;
};

const SWIPE_THRESHOLD = 60;
const GESTURE_RESET_DELAY = 180;

export const useCarousel = (itemCount) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("next");

  const wheelAccumulator = useRef(0);
  const wheelLocked = useRef(false);
  const wheelResetTimer = useRef(null);

  const safeActiveIndex = normalizeIndex(activeIndex, itemCount);

  // Keep the active index valid when items are added or removed.
  useEffect(() => {
    setActiveIndex((current) => normalizeIndex(current, itemCount));
  }, [itemCount]);

  // Reset gesture state and clear the timer when unmounting.
  useEffect(() => {
    return () => {
      if (wheelResetTimer.current !== null) {
        window.clearTimeout(wheelResetTimer.current);
      }
    };
  }, []);

  const goToPrevious = useCallback(() => {
    if (!itemCount) return;

    setDirection("previous");
    setActiveIndex((current) =>
      normalizeIndex(current - 1, itemCount)
    );
  }, [itemCount]);

  const goToNext = useCallback(() => {
    if (!itemCount) return;

    setDirection("next");
    setActiveIndex((current) =>
      normalizeIndex(current + 1, itemCount)
    );
  }, [itemCount]);

  const goToIndex = useCallback(
    (index, nextDirection) => {
      if (!itemCount) return;

      const targetIndex = normalizeIndex(index, itemCount);

      setDirection(
        nextDirection ||
        (targetIndex >= safeActiveIndex ? "next" : "previous")
      );

      setActiveIndex(targetIndex);
    },
    [itemCount, safeActiveIndex]
  );

  // Handle horizontal touchpad gestures.
  // Custom callbacks allow desktop navigation by page.
  const handleWheel = useCallback(
    (event, navigation = {}) => {
      if (!itemCount) return;

      // Ignore vertical scrolling.
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      // Restart the gesture reset timer.
      if (wheelResetTimer.current !== null) {
        window.clearTimeout(wheelResetTimer.current);
      }

      wheelResetTimer.current = window.setTimeout(() => {
        wheelAccumulator.current = 0;
        wheelLocked.current = false;
        wheelResetTimer.current = null;
      }, GESTURE_RESET_DELAY);

      // Navigate only once during a continuous gesture.
      if (wheelLocked.current) return;

      wheelAccumulator.current += event.deltaX;

      if (Math.abs(wheelAccumulator.current) < SWIPE_THRESHOLD) {
        return;
      }

      const moveNext = navigation.onNext || goToNext;
      const movePrevious =
        navigation.onPrevious || goToPrevious;

      if (wheelAccumulator.current > 0) {
        // Swipe left: next slide/page.
        moveNext();
      } else {
        // Swipe right: previous slide/page.
        movePrevious();
      }

      wheelAccumulator.current = 0;
      wheelLocked.current = true;
    },
    [itemCount, goToNext, goToPrevious]
  );

  return {
    activeIndex: safeActiveIndex,
    direction,
    goToPrevious,
    goToNext,
    goToIndex,
    handleWheel,
  };
};
