import { describe, expect, it } from 'vitest'
import { criarRelatorioProgresso } from './relatorioProgresso'
import { trilhaV1 } from './trilha-v1'

describe('relatorio com revisao espacada', () => {
  it('inclui revisao para atividade dominada sem pratica recente', () => {
    const atividade = trilhaV1.modulos[0].atividades[0]
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      [atividade.id],
      [
        {
          atividadeId: atividade.id,
          moduloId: atividade.moduloId,
          timestamp: 1,
          resultado: 'correto',
          nivelDicaUsado: 2,
          tempoRespostaMs: 1000,
        },
      ],
    )

    expect(relatorio.revisaoEspacada?.atividade.id).toBe(atividade.id)
  })
})
