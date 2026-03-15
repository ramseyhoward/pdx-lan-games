import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/steam-search': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/steam-search/, '/api/storesearch'),
      },
      '/api/steam': {
        target: 'https://store.steampowered.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/steam/, '/api/appdetails'),
      },
    },
  },
});
