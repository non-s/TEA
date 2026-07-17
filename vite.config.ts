/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/TEA/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // O manifest estático (public/site.webmanifest) já é referenciado no
      // index.html e cobre ícone/nome/tema — o plugin só adiciona o service
      // worker de precache, sem gerar um segundo manifest.
      manifest: false,
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg'],
      workbox: {
        // App é uma SPA com HashRouter: uma única navegação real
        // (index.html) cobre todas as rotas (/#/...), então o fallback
        // de navegação offline é sempre o mesmo documento.
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
      },
    }),
  ],
  build: {},
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
