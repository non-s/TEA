/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/TEA/',
  plugins: [react(), tailwindcss()],
  build: {
    // O maior chunk esperado e lazy é o vendor do Firestore. Mantemos o
    // orçamento abaixo de 600 kB para ainda sinalizar crescimento real.
    chunkSizeWarningLimit: 600,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
