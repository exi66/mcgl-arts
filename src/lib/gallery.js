// Картины лежат в src/assets/artworks/<Автор>/<Название>.png.
// Папка default — картины без автора.
// При сборке путь сохраняется (см. assetFileNames в vite.config.js),
// поэтому адрес картины стабилен и на неё можно ссылаться с форума.
const images = import.meta.glob(
  "../assets/artworks/*/*.{png,jpg,jpeg,PNG,JPG,JPEG}",
  { eager: true, query: "?url", import: "default" }
);

export const gallery = Object.entries(images).map(([path, src]) => {
  const [folder, file] = path.split("/").slice(-2);
  return {
    src,
    name: file.replace(/\.[^.]+$/, ""),
    author: folder === "default" ? null : folder,
  };
});

// Размер картины в блоках: 64 px на блок
export const CANVAS_BLOCK = 64;
