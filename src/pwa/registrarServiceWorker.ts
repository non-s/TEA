import { registerSW } from 'virtual:pwa-register'
import { definirAtualizacaoDisponivel } from './estadoAtualizacaoPWA'

// Chamado uma vez em main.tsx. Fora de teste (import.meta.env.MODE === 'test')
// para não registrar um service worker real durante Vitest/jsdom.
export function registrarServiceWorkerPWA() {
  if (import.meta.env.MODE === 'test') return
  const atualizar = registerSW({
    immediate: true,
    onNeedRefresh() {
      definirAtualizacaoDisponivel(() => atualizar(true))
    },
    onOfflineReady() {
      // O app já pode ser usado sem internet a partir daqui.
    },
  })
}
