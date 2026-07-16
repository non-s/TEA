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
      if (!verificarDisponibilidade() || !preferencias.som) return

      window.speechSynthesis.cancel() // Interrompe qualquer fala em andamento

      const utterance = new SpeechSynthesisUtterance(texto)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9 // Um pouco mais lento para clareza
      utterance.pitch = 1.1 // Tom um pouco mais agudo/infantil

      window.speechSynthesis.speak(utterance)
    },
    [preferencias.som],
  )

  return { falar, disponivel: verificarDisponibilidade() }
}
