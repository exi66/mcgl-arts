import { type SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Artwork, toBlocks } from '@/lib/gallery';

interface Props {
  artwork: Artwork;
  onOpen: () => void;
}

export function ArtworkCard({ artwork: { src, name, author }, onOpen }: Props) {
  const { t } = useTranslation();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [upscaled, setUpscaled] = useState(false);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget;
    setSize({ width: naturalWidth, height: naturalHeight });
    // Увеличенный пиксель-арт рисуем без сглаживания
    setUpscaled(width >= naturalWidth || height >= naturalHeight);
  };

  return (
    <li className="group relative aspect-square overflow-hidden bg-muted">
      <img
        className="h-full w-full bg-muted object-cover"
        src={src}
        alt={author ? `${name} — ${author}` : name}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        style={{ imageRendering: upscaled ? 'pixelated' : 'auto' }}
      />
      <button
        type="button"
        onClick={onOpen}
        aria-label={t('artwork.open', { name })}
        className="absolute inset-0 flex h-full w-full flex-col justify-end bg-linear-to-t from-background to-transparent text-left opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        <span className="block p-2 text-sm">
          <span className="block font-semibold">{name}</span>
          {author && <span className="block font-semibold">{t('artwork.author', { author })}</span>}
          {size && (
            <span className="block">
              {t('artwork.size', {
                width: size.width,
                height: size.height,
                blocksWidth: toBlocks(size.width),
                blocksHeight: toBlocks(size.height),
              })}
            </span>
          )}
        </span>
      </button>
    </li>
  );
}
