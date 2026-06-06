export const thumbnailVariants = [
  {
    proportion: 0.45,
    softness: 1,
    distortion: 0.25,
    swirl: 0.8,
    swirlIterations: 10,
    shape: "checks",
    shapeScale: 0.1,
    scale: 1,
    rotation: 0,
    speed: 0.55,
    colors: ["--color-ink", "--color-accent", "--color-paper-light", "--color-panel"],
  },
  {
    proportion: 0.34,
    softness: 0.85,
    distortion: 0.32,
    swirl: 0.64,
    swirlIterations: 8,
    shape: "checks",
    shapeScale: 0.16,
    scale: 1.2,
    rotation: 22,
    speed: 0.45,
    colors: ["--color-panel", "--color-paper", "--color-accent", "--color-ink"],
  },
  {
    proportion: 0.56,
    softness: 1.15,
    distortion: 0.22,
    swirl: 0.92,
    swirlIterations: 7,
    shape: "checks",
    shapeScale: 0.08,
    scale: 1.05,
    rotation: -18,
    speed: 0.5,
    colors: ["--color-accent", "--color-ink", "--color-paper-light", "--color-muted"],
  },
  {
    proportion: 0.42,
    softness: 0.7,
    distortion: 0.28,
    swirl: 0.72,
    swirlIterations: 11,
    shape: "checks",
    shapeScale: 0.13,
    scale: 0.92,
    rotation: 41,
    speed: 0.4,
    colors: ["--color-paper-light", "--color-panel", "--color-accent", "--color-ink"],
  },
];

export const getThumbnailVariant = (index = 0) => {
  return thumbnailVariants[index % thumbnailVariants.length];
};

export const resolveThumbnailColors = (colors = []) => {
  if (typeof window === "undefined") {
    return colors.map((color) => (color.startsWith("--") ? `var(${color})` : color));
  }

  const styles = window.getComputedStyle(document.documentElement);

  return colors.map((color) => {
    if (!color.startsWith("--")) return color;
    return styles.getPropertyValue(color).trim() || `var(${color})`;
  });
};
