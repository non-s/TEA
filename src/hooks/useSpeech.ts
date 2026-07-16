import { useCallback, useEffect } from 'react'
import { usePreferencias } from '../contexts/PreferenciasContext'

function verificarDisponibilidade(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function useSpeech() {
  const { preferencias } = usePreferencias()

  useEffect(() => {
    if (!verificarDisponibilidade()) return

    if (!preferencias.som) {
      window.speechSynthesis.cancel()
    }

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [preferencias.som])

  const falar = useCallback((_texto: string) => {
    // Fala desativada conforme solicitado.
  }, [])

  return { falar, disponivel: verificarDisponibilidade() }
}
