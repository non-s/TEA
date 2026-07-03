import { getAuth } from 'firebase/auth'
import { app } from './app'

/**
 * Só inicializa Auth aqui, não Firestore nem App Check — AuthContext importa
 * `auth` de forma eager porque a sessão do responsável precisa ser conhecida
 * em toda a árvore, inclusive na home pública. Firestore e App Check ficam em
 * `./db.ts`, importado só pelos módulos que leem/escrevem dados familiares.
 */
export const auth = getAuth(app)
