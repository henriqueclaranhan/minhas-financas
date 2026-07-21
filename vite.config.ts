/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        id: '/',
        name: 'Minhas Finanças',
        short_name: 'MinhasFinanças',
        description: 'Gerenciador de finanças pessoais focado em usabilidade e desempenho.',
        lang: 'pt-BR',
        theme_color: '#34c759',
        background_color: '#ffffff',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          },
          {
            src: 'maskable-icon-v2-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Início',
            short_name: 'Início',
            description: 'Abrir o resumo das suas finanças',
            url: '/',
            icons: [{ src: 'shortcut-home-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Transações',
            short_name: 'Transações',
            description: 'Abrir o histórico de transações',
            url: '/transactions',
            icons: [{ src: 'shortcut-transactions-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Planejamento',
            short_name: 'Planejamento',
            description: 'Abrir receitas e despesas planejadas',
            url: '/planned',
            icons: [{ src: 'shortcut-planning-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'Faturas',
            short_name: 'Faturas',
            description: 'Abrir faturas e compras no crédito',
            url: '/credit',
            icons: [{ src: 'shortcut-invoices-192x192.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
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
    exclude: ['tests/**', '**/node_modules/**', '**/dist/**'],
  },
})
