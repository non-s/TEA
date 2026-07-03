import { describe, expect, it } from 'vitest'
import { trilhaV1 } from './trilha-v1'
import { encontrarProximaAtividadeAposConclusao } from './proximoPassoSessao'

function todosIdsExceto(atividadeId: string): string[] {
  return trilhaV1.modulos.flatMap((modulo) =>
    modulo.atividades
      .map((atividade) => atividade.id)
      .filter((id) => id !== atividadeId),
  )
}

describe('encontrarProximaAtividadeAposConclusao', () => {
  it('calcula a proxima atividade apos concluir a primeira da trilha', () => {
    const proxima = encontrarProximaAtividadeAposConclusao(
      trilhaV1,
      [],
      [],
      'm0-n1-a1',
    )

    expect(proxima?.id).toBe('m0-n1-a2')
  })

  it('considera atividades dominadas na sessao antes do snapshot remoto atualizar', () => {
    const proxima = encontrarProximaAtividadeAposConclusao(
      trilhaV1,
      [],
      ['m0-n1-a1'],
      'm0-n1-a2',
    )

    expect(proxima?.id).toBe('m0-n1-a3')
  })

  it('retorna null quando a atividade concluida fecha a trilha atual', () => {
    const ultimaAtividade =
      trilhaV1.modulos.at(-1)?.atividades.at(-1)?.id ?? 'atividade-final'

    const proxima = encontrarProximaAtividadeAposConclusao(
      trilhaV1,
      todosIdsExceto(ultimaAtividade),
      [],
      ultimaAtividade,
    )

    expect(proxima).toBeNull()
  })
})
