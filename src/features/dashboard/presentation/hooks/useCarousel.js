import { useState } from "react";

const normalizeIndex = (index, length) => {
  if (!length) return 0;
  return ((index % length) + length) % length;
};

export const useCarousel = (itemCount) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const safeActiveIndex = normalizeIndex(activeIndex, itemCount);

  const goToPrevious = () => {
    if (!itemCount) return;
    setDirection("previous");
    setActiveIndex(normalizeIndex(safeActiveIndex - 1, itemCount));
  };

  const goToNext = () => {
    if (!itemCount) return;
    setDirection("next");
    setActiveIndex(normalizeIndex(safeActiveIndex + 1, itemCount));
  };

  const goToIndex = (index, nextDirection) => {
    if (!itemCount) return;
    setDirection(nextDirection || (index >= safeActiveIndex ? "next" : "previous"));
    setActiveIndex(normalizeIndex(index, itemCount));
  };

  return {
    activeIndex: safeActiveIndex,
    direction,
    goToPrevious,
    goToNext,
    goToIndex,
  };
};
