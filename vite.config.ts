import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works from a GitHub Pages sub-path.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        layout: resolve(__dirname, 'kitchen-layout.html'),
      },
    },
  },
});
