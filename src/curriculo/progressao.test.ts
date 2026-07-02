import { describe, expect, it } from 'vitest'
import { moduloDesbloqueado } from './progressao'
import { trilhaV1 } from './trilha-v1'

describe('moduloDesbloqueado', () => {
  it('sempre desbloqueia um módulo sem pré-requisito', () => {
    expect(moduloDesbloqueado(undefined, new Set())).toBe(true)
  })

  it('mantém bloqueado se nenhuma atividade do pré-requisito foi dominada', () => {
    expect(moduloDesbloqueado('m0', new Set())).toBe(false)
  })

  it('mantém bloqueado se só parte das atividades do pré-requisito foi dominada', () => {
    const modulo0 = trilhaV1.modulos.find((m) => m.id === 'm0')!
    const algumas = modulo0.atividades.slice(0, 1).map((a) => a.id)
    expect(moduloDesbloqueado('m0', new Set(algumas))).toBe(false)
  })

  it('desbloqueia quando todas as atividades do pré-requisito foram dominadas', () => {
    const modulo0 = trilhaV1.modulos.find((m) => m.id === 'm0')!
    const todas = modulo0.atividades.map((a) => a.id)
    expect(moduloDesbloqueado('m0', new Set(todas))).toBe(true)
  })

  it('desbloqueia se o pré-requisito referenciado não existir (proteção contra dado inconsistente)', () => {
    expect(moduloDesbloqueado('modulo-inexistente', new Set())).toBe(true)
  })
})
