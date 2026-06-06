import { Warp } from "@paper-design/shaders-react";
import { getThumbnailVariant, resolveThumbnailColors } from "@/features/dashboard/presentation/utils/thumbnailVariants";

const DefaultThumbnail = ({ index = 0 }) => {
  const variant = getThumbnailVariant(index);
  const colors = resolveThumbnailColors(variant.colors);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--color-panel)]">
      <Warp
        style={{ width: "100%", height: "100%" }}
        proportion={variant.proportion}
        softness={variant.softness}
        distortion={variant.distortion}
        swirl={variant.swirl}
        swirlIterations={variant.swirlIterations}
        shape={variant.shape}
        shapeScale={variant.shapeScale}
        scale={variant.scale}
        rotation={variant.rotation}
        speed={variant.speed}
        colors={colors}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--color-ink-rgb)/0.18)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--color-ink-rgb)/0.18)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute left-4 top-4 border-2 border-[var(--color-ink)] bg-[var(--color-paper-light)] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-ink)] shadow-[3px_3px_0_var(--color-ink)]">
        Portfolio
      </div>
    </div>
  );
};

export default DefaultThumbnail;
