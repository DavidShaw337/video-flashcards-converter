import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src/',
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // Proxy API requests to Express
    },
  },
  build: {
    outDir: '../dist', // Output directory for the build
    emptyOutDir: true, // Clear the output directory before building
  },
});
