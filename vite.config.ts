import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // In development, we proxy /api requests to our local Express server running on port 3000
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
