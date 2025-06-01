// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /v1.0 requests to your backend
      '/v1.0': {
        target: 'http://localhost:8080', // Your backend server
        changeOrigin: true, // Important for virtual hosted sites
        // secure: false, // If your backend uses self-signed SSL in dev
      }
    }
  }
});