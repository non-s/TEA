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
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  updateDoc: vi.fn(),
  onSnapshot: () => () => {},
}))
