import { useState } from "react";
import { CANVAS_BLOCK } from "@/lib/gallery";

export function ArtworkCard({ artwork: { src, name, author }, onOpen }) {
  const [size, setSize] = useState(null);
  const [upscaled, setUpscaled] = useState(false);

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
    setSize({ width: naturalWidth, height: naturalHeight });
    // Увеличенный пиксель-арт рисуем без сглаживания
    setUpscaled(width >= naturalWidth || height >= naturalHeight);
  };

  return (
    <li className="aspect-square bg-muted relative group rounded overflow-hidden">
      <img
        className="h-full w-full object-cover bg-muted"
        src={src}
        alt={author ? `${name} — ${author}` : name}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        style={{ imageRendering: upscaled ? "pixelated" : "auto" }}
      />
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Открыть «${name}»`}
        className="absolute inset-0 w-full h-full cursor-pointer text-left flex flex-col justify-end bg-linear-to-t from-background to-transparent transition-opacity opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="p-2 block">
          <span className="font-semibold block">{name}</span>
          {author && <span className="font-semibold block">by {author}</span>}
          {size && (
            <span className="block">
              {size.width} × {size.height} (
              {Math.floor(size.width / CANVAS_BLOCK)} ×{" "}
              {Math.floor(size.height / CANVAS_BLOCK)})
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
