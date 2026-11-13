import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: "/mcgl-arts/",
  plugins: [react(), tailwindcss()],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Картинки сохраняют путь из src/assets (artworks/<Автор>/<Название>.png):
        // их адреса используются на форуме и не должны меняться между сборками.
        // Остальным ассетам (CSS) — хэш для сброса кэша.
        assetFileNames: (info) => {
          const source = info.originalFileNames?.[0] ?? "";
          const artwork = source.match(/src\/assets\/(artworks\/.+)$/);
          return artwork ? artwork[1] : "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
