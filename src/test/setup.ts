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

// Testes de componente não devem depender de um backend Firebase real
// (nem de rede, nem de variáveis de ambiente configuradas no CI). Como
// App.tsx importa todas as rotas de forma estática, mockamos o SDK aqui
// para que qualquer teste que renderize <App /> funcione isolado.
vi.mock('firebase/app', () => ({
  initializeApp: () => ({}),
}))

vi.mock('firebase/auth', () => ({
  getAuth: () => ({}),
  onAuthStateChanged: (_auth: unknown, proximo: (usuario: null) => void) => {
    proximo(null)
    return () => {}
  },
  deleteUser: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
  createUserWithEmailAndPassword: vi.fn(),
  reauthenticateWithCredential: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
}))

vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(() => ({})),
  ReCaptchaV3Provider: vi.fn(function (
    this: { siteKey?: string },
    siteKey: string,
  ) {
    this.siteKey = siteKey
  }),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  initializeFirestore: vi.fn(() => ({})),
  memoryLocalCache: vi.fn(() => 'memory-cache'),
  persistentLocalCache: vi.fn(() => 'persistent-cache'),
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  limit: vi.fn(),
  updateDoc: vi.fn(),
  arrayUnion: vi.fn(),
  arrayRemove: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  writeBatch: vi.fn(),
  onSnapshot: () => () => {},
}))
