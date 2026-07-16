import { useCallback } from 'react'

export function useSpeech() {
  const falar = useCallback((_texto: string) => {}, [])
  return { falar, disponivel: false }
}
