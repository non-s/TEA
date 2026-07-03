import { describe, expect, it } from 'vitest'
import { criarRelatorioProgresso } from './relatorioProgresso'
import { trilhaV1 } from './trilha-v1'
import type { PlanoIndividual } from '../firebase/perfis'

describe('relatorio com plano individual', () => {
  it('inclui meta individual, apoio preferencial e observacao na recomendacao', () => {
    const planoIndividual: PlanoIndividual = {
      metaAtual: 'pedir pausa antes de abandonar a atividade',
      apoioPreferencial: 'pausa',
      observacaoMediador: 'usar combinados curtos',
    }

    const relatorio = criarRelatorioProgresso(trilhaV1, [], [], planoIndividual)

    expect(relatorio.recomendacaoMediacao).toContain(
      'pedir pausa antes de abandonar a atividade',
    )
    expect(relatorio.recomendacaoMediacao).toContain('pausas combinadas')
    expect(relatorio.recomendacaoMediacao).toContain('usar combinados curtos')
  })
})
