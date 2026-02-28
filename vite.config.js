import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: "./",   // <-- ADD THIS LINE
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://ftsa-ai-backend.onrender.com',
        changeOrigin: true,
      },
    },
  },
});