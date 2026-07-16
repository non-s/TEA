import { describe, expect, it } from 'vitest'
import {
  encontrarAtividadeParaRevisao,
  encontrarProximaAtividadeDisponivel,
  moduloDesbloqueado,
} from './progressao'
import { trilhaV1 } from './trilha-v1'
import type { Tentativa } from './tipos'

describe('moduloDesbloqueado', () => {
  it('sempre desbloqueia um módulo sem pré-requisito', () => {
    expect(moduloDesbloqueado(undefined, new Set(), trilhaV1)).toBe(true)
  })

  it('mantém bloqueado se nenhuma atividade do pré-requisito foi dominada', () => {
    expect(moduloDesbloqueado('m0', new Set(), trilhaV1)).toBe(false)
  })

  it('mantém bloqueado se só parte das atividades do pré-requisito foi dominada', () => {
    const modulo0 = trilhaV1.modulos.find((m) => m.id === 'm0')!
    const algumas = modulo0.atividades.slice(0, 1).map((a) => a.id)
    expect(moduloDesbloqueado('m0', new Set(algumas), trilhaV1)).toBe(false)
  })

  it('desbloqueia quando todas as atividades do pré-requisito foram dominadas', () => {
    const modulo0 = trilhaV1.modulos.find((m) => m.id === 'm0')!
    const todas = modulo0.atividades.map((a) => a.id)
    expect(moduloDesbloqueado('m0', new Set(todas), trilhaV1)).toBe(true)
  })

  it('desbloqueia se o pré-requisito referenciado não existir (proteção contra dado inconsistente)', () => {
    expect(moduloDesbloqueado('modulo-inexistente', new Set(), trilhaV1)).toBe(true)
  })
  it('encontra a primeira atividade disponível ainda não dominada', () => {
    expect(encontrarProximaAtividadeDisponivel(trilhaV1, new Set())?.id).toBe(
      'm0-n1-a1',
    )

    const modulo0 = trilhaV1.modulos.find((m) => m.id === 'm0')!
    const dominadasModulo0 = new Set(modulo0.atividades.map((a) => a.id))
    expect(
      encontrarProximaAtividadeDisponivel(trilhaV1, dominadasModulo0)?.moduloId,
    ).toBe('m1')
  })

  it('sugere revisao espacada para atividade dominada sem pratica recente', () => {
    const atividade = trilhaV1.modulos[0].atividades[0]
    const tresDias = 3 * 24 * 60 * 60 * 1000
    const tentativas: Tentativa[] = [
      {
        atividadeId: atividade.id,
        moduloId: atividade.moduloId,
        timestamp: 1_000,
        resultado: 'correto',
        nivelDicaUsado: 2,
        tempoRespostaMs: 1000,
      },
    ]

    const revisao = encontrarAtividadeParaRevisao(
      trilhaV1,
      new Set([atividade.id]),
      tentativas,
      1_000 + tresDias,
    )

    expect(revisao?.atividade.id).toBe(atividade.id)
    expect(revisao?.diasDesdeUltimaPratica).toBe(3)
  })

  it('nao sugere revisao quando a atividade dominada foi praticada recentemente', () => {
    const atividade = trilhaV1.modulos[0].atividades[0]
    const tentativas: Tentativa[] = [
      {
        atividadeId: atividade.id,
        moduloId: atividade.moduloId,
        timestamp: 10_000,
        resultado: 'correto',
        nivelDicaUsado: 2,
        tempoRespostaMs: 1000,
      },
    ]

    const revisao = encontrarAtividadeParaRevisao(
      trilhaV1,
      new Set([atividade.id]),
      tentativas,
      10_000 + 24 * 60 * 60 * 1000,
    )

    expect(revisao).toBeNull()
  })
})
