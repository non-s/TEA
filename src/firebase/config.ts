import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { app } from './app'

/**
 * Só inicializa Auth aqui, não Firestore nem App Check — AuthContext importa
 * `auth` de forma eager porque a sessão do responsável precisa ser conhecida
 * em toda a árvore, inclusive na home pública. Firestore e App Check ficam em
 * `./db.ts`, importado só pelos módulos que leem/escrevem dados familiares.
 */
export const auth = getAuth(app)

if (
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' &&
  import.meta.env.MODE !== 'test'
) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
    disableWarnings: true,
  })
}
