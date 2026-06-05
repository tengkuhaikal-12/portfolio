import { Warp } from "@paper-design/shaders-react";
import { getThumbnailVariant } from "@/features/dashboard/presentation/utils/thumbnailVariants";

const DefaultThumbnail = ({ index = 0 }) => {
  const variant = getThumbnailVariant(index);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#242421]">
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
        colors={variant.colors}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(21,21,19,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(21,21,19,0.18)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute left-4 top-4 border-2 border-[#151513] bg-[#fbf8f0] px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-[#151513] shadow-[3px_3px_0_#151513]">
        Portfolio
      </div>
    </div>
  );
};

export default DefaultThumbnail;
