import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    vue(),
    viteCompression(),
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
    // ADICIONA ISTO AQUI (resolve o erro CSP em dev)
    headers: {
      "Content-Security-Policy": ""
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['bootstrap', '@popperjs/core', '@fortawesome/fontawesome-free', 'material-icons'],
          'chart-vendor': ['chart.js', 'vue-chartjs'],
          'maps-vendor': ['leaflet'],
          'pdf-vendor': ['jspdf', 'html2canvas', 'html2pdf.js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});