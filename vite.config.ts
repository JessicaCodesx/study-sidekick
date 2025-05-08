import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isElectron = process.env.BUILD_TARGET === 'electron';
const isDev = process.env.NODE_ENV === 'development';
const repoName = 'study-sidekick';

export default defineConfig({
  base: isDev || isElectron ? '/' : `/${repoName}/`,
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
