import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isElectron = process.env.BUILD_TARGET === 'electron';
const isDev = process.env.NODE_ENV === 'development';
const repoName = 'study-sidekick';

// Determine base path: use repo name for GitHub Pages production builds, root for electron/dev
// For GitHub Pages, we need the base path to match the repository name
// Default to GitHub Pages path unless explicitly in dev or electron mode
const basePath = (isDev || isElectron) ? '/' : `/${repoName}/`;

// Log for debugging during build (this runs at build time, not runtime)
console.log(`[Vite Config] NODE_ENV: ${process.env.NODE_ENV || 'undefined'}, BUILD_TARGET: ${process.env.BUILD_TARGET || 'undefined'}`);
console.log(`[Vite Config] isDev: ${isDev}, isElectron: ${isElectron}`);
console.log(`[Vite Config] Using base path: "${basePath}"`);

export default defineConfig({
  base: basePath,
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
