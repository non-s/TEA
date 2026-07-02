import { getAuth } from 'firebase/auth'
import { app } from './app'

/**
 * Só inicializa Auth aqui, não Firestore — AuthContext importa `auth`
 * de forma eager (a sessão do responsável precisa ser conhecida em toda
 * a árvore, inclusive na home pública). Firestore fica em `./db.ts`,
 * importado só pelos módulos usados dentro de rotas lazy-loaded, para
 * não inflar o bundle inicial de quem só está vendo a home.
 */
export const auth = getAuth(app)
