import { beforeEach, describe, expect, it } from 'vitest'
import {
  CHAVE_CACHE_OFFLINE_FIRESTORE,
  cacheOfflineFirestoreAtivo,
  definirCacheOfflineFirestore,
} from './db'

describe('cache offline do Firestore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('fica desativado por padrao', () => {
    expect(cacheOfflineFirestoreAtivo()).toBe(false)
  })

  it('salva escolha local do dispositivo', () => {
    expect(definirCacheOfflineFirestore(true)).toBe(true)
    expect(localStorage.getItem(CHAVE_CACHE_OFFLINE_FIRESTORE)).toBe('true')
    expect(cacheOfflineFirestoreAtivo()).toBe(true)

    expect(definirCacheOfflineFirestore(false)).toBe(true)
    expect(localStorage.getItem(CHAVE_CACHE_OFFLINE_FIRESTORE)).toBeNull()
    expect(cacheOfflineFirestoreAtivo()).toBe(false)
  })
})
