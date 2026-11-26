import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Relative base: the build works from any sub-path (GitHub Pages /<repo>/ included).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Картинки всегда отдельными файлами, даже маленькие: у каждой должен быть свой адрес.
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        // Картины сохраняют путь из src/assets (artworks/<Автор>/<Название>.png): их адреса используются на форуме и не
        // должны меняться между сборками. Остальным ассетам — хэш для сброса кэша.
        assetFileNames: (info) => {
          const source = info.originalFileNames?.[0] ?? '';
          const artwork = source.match(/src\/assets\/(artworks\/.+)$/);
          return artwork ? artwork[1] : 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    // i18n is initialised for tests too: code outside React translates with i18next.t().
    setupFiles: ['src/lib/i18n.ts'],
  },
});
