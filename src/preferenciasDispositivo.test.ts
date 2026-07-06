import { beforeEach, describe, expect, it } from 'vitest'
import {
  CHAVE_RESPOSTA_POR_VOZ,
  definirRespostaPorVoz,
  respostaPorVozAtiva,
} from './preferenciasDispositivo'

describe('resposta por voz (preferência do dispositivo)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('fica desativada por padrão', () => {
    expect(respostaPorVozAtiva()).toBe(false)
  })

  it('salva a escolha local do dispositivo', () => {
    expect(definirRespostaPorVoz(true)).toBe(true)
    expect(localStorage.getItem(CHAVE_RESPOSTA_POR_VOZ)).toBe('true')
    expect(respostaPorVozAtiva()).toBe(true)

    expect(definirRespostaPorVoz(false)).toBe(true)
    expect(localStorage.getItem(CHAVE_RESPOSTA_POR_VOZ)).toBeNull()
    expect(respostaPorVozAtiva()).toBe(false)
  })
})
