import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const isElectron = process.env.BUILD_TARGET === 'electron';
const repoName = 'study-sidekick';

export default defineConfig({
  base: isElectron ? './' : `/${repoName}/`,
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
