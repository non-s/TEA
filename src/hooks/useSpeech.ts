import { useCallback } from 'react'
import { usePreferencias } from '../contexts/PreferenciasContext'

function verificarDisponibilidade(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function useSpeech() {
  const { preferencias } = usePreferencias()

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
