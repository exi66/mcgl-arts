// Картины лежат в src/assets/artworks/<Автор>/<Название>.png; папка default — картины без автора.
// При сборке путь сохраняется (см. assetFileNames в vite.config.ts): адрес картины стабилен, на него ссылаются с форума.
const images = import.meta.glob<string>('../assets/artworks/*/*.{png,jpg,jpeg,PNG,JPG,JPEG}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export interface Artwork {
  src: string;
  name: string;
  author: string | null;
}

/** Разбирает путь `.../<Автор>/<Название>.<ext>` в название и автора. */
export function parseArtworkPath(path: string): Omit<Artwork, 'src'> {
  const [folder, file] = path.split('/').slice(-2);
  return {
    name: file.replace(/\.[^.]+$/, ''),
    author: folder === 'default' ? null : folder,
  };
}

export const gallery: Artwork[] = Object.entries(images).map(([path, src]) => ({ src, ...parseArtworkPath(path) }));

/** Размер картины в блоках: 64 px на блок. */
export const CANVAS_BLOCK = 64;

export const toBlocks = (px: number) => Math.floor(px / CANVAS_BLOCK);
