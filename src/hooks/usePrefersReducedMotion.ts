import { useEffect, useState } from 'react'

export function usePrefersReducedMotion(): boolean {
  const [prefereReduzido, setPrefereReduzido] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const consulta = window.matchMedia('(prefers-reduced-motion: reduce)')
    const aoMudar = (evento: MediaQueryListEvent) =>
      setPrefereReduzido(evento.matches)
    consulta.addEventListener('change', aoMudar)
    return () => consulta.removeEventListener('change', aoMudar)
  }, [])

  return prefereReduzido
}
