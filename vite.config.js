import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    vue(),
    viteCompression({ algorithm: 'gzip', ext: '.gz' }),
    viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'rpa.png'],
      manifest: {
        name: 'Recupera Aqui - Moçambique',
        short_name: 'RecuperaAqui',
        description: 'Plataforma líder em Moçambique para recuperação de documentos perdidos.',
        theme_color: '#800080',
        background_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    headers: {
      "Content-Security-Policy": ""
    }
  },
  build: {
    target: 'esnext',          // Bundle menor e mais rápido para browsers modernos
    cssCodeSplit: true,         // CSS separado por rota = carregamento mais rápido
    sourcemap: false,           // Sem sourcemaps em produção = build menor
    minify: 'esbuild',         // esbuild é ~10x mais rápido que terser
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['bootstrap', '@popperjs/core'],
          'chart-vendor': ['chart.js', 'vue-chartjs'],
          'maps-vendor': ['leaflet'],
          'pdf-vendor': ['jspdf', 'html2canvas', 'html2pdf.js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});