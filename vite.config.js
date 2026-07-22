import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Native Windows file events can be missed in mounted or synced folders.
      // Polling keeps React Fast Refresh reliable while developing locally.
      usePolling: true,
      interval: 300,
    },
  },
});
