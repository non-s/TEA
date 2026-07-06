import { useSyncExternalStore } from 'react'
import {
  assinarAtualizacaoPWA,
  obterAtualizacaoDisponivel,
} from '../pwa/estadoAtualizacaoPWA'

function inscrever(ouvir: () => void) {
  window.addEventListener('online', ouvir)
  window.addEventListener('offline', ouvir)
  return () => {
    window.removeEventListener('online', ouvir)
    window.removeEventListener('offline', ouvir)
  }
}

function lerEstado(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

/** True quando o navegador está sem conexão (evento `offline` do browser). */
export function useEstaOffline(): boolean {
  return !useSyncExternalStore(inscrever, lerEstado, () => true)
}

/** Callback para aplicar uma atualização do app já baixada, ou null se
 * nenhuma atualização estiver esperando. */
export function useAtualizacaoPWADisponivel(): (() => void) | null {
  return useSyncExternalStore(
    assinarAtualizacaoPWA,
    obterAtualizacaoDisponivel,
    () => null,
  )
}
