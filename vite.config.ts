/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'vendor_icons';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor_charts';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor_react';
            }
            if (id.includes('date-fns')) {
              return 'vendor_date';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 800,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
