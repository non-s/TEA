import '@testing-library/jest-dom/vitest'

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
