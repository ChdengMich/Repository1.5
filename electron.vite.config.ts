import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/main/index.ts'),
        },
      },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/preload/index.ts'),
        },
      },
    },
  },
  renderer: {
    root: path.join(__dirname, 'src'),
    build: {
      rollupOptions: {
        input: {
          index: path.join(__dirname, 'src/index.html'),
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },
  },
}); 