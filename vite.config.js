// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // ✅ Move this here
    proxy: {
      '/v1.0': {
        target: 'https://be-exe2-1.onrender.com',
        changeOrigin: true,
      }
    }
  }
});
