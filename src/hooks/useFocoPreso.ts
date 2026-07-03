import { useCallback, useRef, type KeyboardEvent } from 'react'

const seletorFocavel = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function listarElementosFocaveis(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(seletorFocavel))
    .filter((elemento) => !elemento.hasAttribute('disabled'))
    .filter((elemento) => elemento.getAttribute('aria-hidden') !== 'true')
}

export function useFocoPreso<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  const aoKeyDown = useCallback((evento: KeyboardEvent<T>) => {
    if (evento.key !== 'Tab') return

    const container = ref.current
    if (!container) return

    const focaveis = listarElementosFocaveis(container)
    if (focaveis.length === 0) {
      evento.preventDefault()
      container.focus()
      return
    }

    const primeiro = focaveis[0]
    const ultimo = focaveis[focaveis.length - 1]
    const ativo = document.activeElement

    if (!container.contains(ativo)) {
      evento.preventDefault()
      primeiro.focus()
      return
    }

    if (evento.shiftKey && ativo === primeiro) {
      evento.preventDefault()
      ultimo.focus()
      return
    }

    if (!evento.shiftKey && ativo === ultimo) {
      evento.preventDefault()
      primeiro.focus()
    }
  }, [])

  return { ref, aoKeyDown }
}
