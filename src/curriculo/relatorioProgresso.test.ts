import { describe, expect, it } from 'vitest'
import { trilhaV1 } from './trilha-v1'
import type { Tentativa } from './tipos'
import { criarRelatorioProgresso } from './relatorioProgresso'

describe('criarRelatorioProgresso', () => {
  it('recomenda a primeira atividade disponível quando nada foi dominado', () => {
    const relatorio = criarRelatorioProgresso(trilhaV1, [], [])

    expect(relatorio.totalAtividades).toBeGreaterThan(0)
    expect(relatorio.percentualGeral).toBe(0)
    expect(relatorio.proximaAtividade?.id).toBe('m0-n1-a1')
    expect(relatorio.resumoPorModulo[1].status).toBe('bloqueado')
    expect(relatorio.recomendacaoApoioGraduado).toContain('Comece')
  })

  it('marca módulo dominado e recomenda o próximo módulo desbloqueado', () => {
    const dominadasModulo0 = trilhaV1.modulos[0].atividades.map(
      (atividade) => atividade.id,
    )

    const relatorio = criarRelatorioProgresso(trilhaV1, dominadasModulo0, [])

    expect(relatorio.resumoPorModulo[0].status).toBe('dominado')
    expect(relatorio.resumoPorModulo[1].status).toBe('nao-iniciado')
    expect(relatorio.proximaAtividade?.moduloId).toBe('m1')
  })

  it('orienta aumentar apoio quando há baixa taxa de acerto', () => {
    const tentativas: Tentativa[] = [
      {
        atividadeId: 'm0-n1-a1',
        moduloId: 'm0',
        timestamp: 1,
        resultado: 'incorreto',
        nivelDicaUsado: 2,
        tempoRespostaMs: 1000,
      },
      {
        atividadeId: 'm0-n1-a1',
        moduloId: 'm0',
        timestamp: 2,
        resultado: 'correto',
        nivelDicaUsado: 1,
        tempoRespostaMs: 1000,
      },
    ]

    const relatorio = criarRelatorioProgresso(trilhaV1, [], tentativas)

    expect(relatorio.resumoPorModulo[0].percentualAcerto).toBe(50)
    expect(relatorio.orientacao).toContain('mais apoio visual')
    expect(relatorio.recomendacaoApoioGraduado).toContain('Aumente o apoio')
  })

  it('orienta reduzir apoio quando ha acerto com suporte alto', () => {
    const tentativas: Tentativa[] = [1, 2, 3, 4].map((timestamp) => ({
      atividadeId: 'm0-n1-a1',
      moduloId: 'm0',
      timestamp,
      resultado: 'correto',
      nivelDicaUsado: 1,
      tempoRespostaMs: 1000,
    }))

    const relatorio = criarRelatorioProgresso(trilhaV1, [], tentativas)

    expect(relatorio.recomendacaoApoioGraduado).toContain('Reduza um passo')
  })

  it('descreve últimas tentativas com rótulos humanos e apoio usado', () => {
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      [],
      [
        {
          atividadeId: 'm0-n1-a1',
          moduloId: 'm0',
          timestamp: 1,
          resultado: 'correto',
          nivelDicaUsado: 0,
          tempoRespostaMs: 1000,
        },
      ],
    )

    expect(relatorio.ultimasTentativas[0]).toMatchObject({
      atividadeRotulo: 'círculo',
      moduloTitulo: 'Emparelhamento Idêntico',
      apoioUsado: 'alto',
    })
  })
})
