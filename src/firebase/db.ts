import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
} from 'firebase/firestore'
import { app } from './app'
import { inicializarAppCheck } from './appCheck'

inicializarAppCheck()

const usaEmuladorFirebase =
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true' &&
  import.meta.env.MODE !== 'test'

export const CHAVE_CACHE_OFFLINE_FIRESTORE = 'tea:cache-offline-firestore'

export function cacheOfflineFirestoreAtivo(): boolean {
  try {
    return localStorage.getItem(CHAVE_CACHE_OFFLINE_FIRESTORE) === 'true'
  } catch {
    return false
  }
}

export function definirCacheOfflineFirestore(ativo: boolean) {
  try {
    if (ativo) {
      localStorage.setItem(CHAVE_CACHE_OFFLINE_FIRESTORE, 'true')
    } else {
      localStorage.removeItem(CHAVE_CACHE_OFFLINE_FIRESTORE)
    }
    return true
  } catch {
    return false
  }
}

function inicializarDb() {
  try {
    return initializeFirestore(app, {
      localCache:
        cacheOfflineFirestoreAtivo() && !usaEmuladorFirebase
          ? persistentLocalCache({})
          : memoryLocalCache(),
    })
  } catch {
    return getFirestore(app)
  }
}

export const db = inicializarDb()

if (usaEmuladorFirebase) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
