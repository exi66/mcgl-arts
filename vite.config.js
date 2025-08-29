import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  base: "/mcgl-arts/",
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: "[name].[ext]",
      },
    },
  },
  resolve: {
    alias: {
      "@arts": path.resolve(__dirname, "src/assets/arts"),
    },
  },
});
