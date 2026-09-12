import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// GitHub Pages: repository is at faridath07/IndabaX_Equipe_18
// The site is served from https://faridath07.github.io/IndabaX_Equipe_18/
const REPO = "IndabaX_Equipe_18";

export default defineConfig({
  plugins: [react()],
  root: "client",
  base: `/${REPO}/`,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "map": ["leaflet", "react-leaflet"],
          "charts": ["recharts"],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    alias: [
      { find: "@shared", replacement: path.resolve(__dirname, "shared") },
      { find: "@", replacement: path.resolve(__dirname, "client/src") },
    ],
  },
} as any);
