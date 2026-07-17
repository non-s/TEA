import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom não implementa matchMedia; a maioria dos componentes usa
// prefers-reduced-motion/prefers-color-scheme, então fornecemos um stub
// padrão ("não corresponde") para os testes.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// axe-core consulta canvas em algumas verificacoes. O jsdom declara
// getContext(), mas imprime "Not implemented" quando ele e chamado. Um
// contexto 2D minimo remove esse ruido sem alterar o DOM renderizado.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: (contextId: string) =>
    contextId === '2d'
      ? ({
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          getImageData: vi.fn(() => ({
            data: new Uint8ClampedArray(4),
            height: 1,
            width: 1,
          })),
          measureText: vi.fn(() => ({ width: 0 })),
          putImageData: vi.fn(),
        } as unknown as CanvasRenderingContext2D)
      : null,
})

// axe-core tambem consulta estilos de ::before/::after. O jsdom registra
// aviso para pseudo-elementos; usar o estilo do proprio elemento basta para
// manter as verificacoes de acessibilidade deterministicas nos testes.
const getComputedStyleOriginal = window.getComputedStyle.bind(window)

Object.defineProperty(window, 'getComputedStyle', {
  configurable: true,
  value: (element: Element, pseudoElement?: string | null) =>
    pseudoElement
      ? getComputedStyleOriginal(element)
      : getComputedStyleOriginal(element, pseudoElement),
})
