import { describe, expect, it } from 'vitest'
import {
  encontrarAtividadeParaRevisao,
  encontrarProximaAtividadeDisponivel,
} from './progressao'
import { trilhaV1 } from './trilha-v1'
import type { Tentativa } from './tipos'

describe('encontrarProximaAtividadeDisponivel', () => {
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
})

describe('encontrarAtividadeParaRevisao', () => {
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
