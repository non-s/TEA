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

  const falar = useCallback(
    (texto: string) => {
      if (!preferencias.som || !verificarDisponibilidade()) return

      window.speechSynthesis.cancel()
      const fala = new SpeechSynthesisUtterance(texto)
      fala.lang = 'pt-BR'
      window.speechSynthesis.speak(fala)
    },
    [preferencias.som],
  )

  return { falar, disponivel: verificarDisponibilidade() }
}
