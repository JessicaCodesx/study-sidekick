import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // ← this is important for Electron!
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
