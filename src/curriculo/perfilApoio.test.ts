import { describe, expect, it } from 'vitest'
import {
  LIMITE_OBSERVACAO_MEDIADOR,
  LIMITE_OBSERVACOES_PERFIL_APOIO,
  LIMITE_TEXTO_PLANO_REGULACAO,
  criarAjustesIniciaisPerfilApoio,
  descreverPerfilApoio,
  normalizarPerfilApoio,
  normalizarPlanoRegulacao,
  type PerfilApoio,
} from './perfilApoio'

const planoRegulacaoVazio = {
  sinaisPausa: '',
  estrategiasAjudam: '',
  evitarDuranteSobrecarga: '',
}

describe('perfilApoio', () => {
  it('ativa alvos maiores para escolha mediada e sugere apoio visual', () => {
    const perfilApoio: PerfilApoio = {
      comunicacaoPreferencial: 'figuras',
      acessoPreferencial: 'escolha-mediada',
      regulacaoPreferencial: 'alternar',
      limiteTentativasAntesPausa: 6,
      cartoesComunicacao: [],
      planoRegulacao: planoRegulacaoVazio,
      observacoes: '',
    }

    const ajustes = criarAjustesIniciaisPerfilApoio(perfilApoio)

    expect(ajustes.preferenciasSensoriais.alvosMaiores).toBe(true)
    expect(ajustes.planoIndividual.apoioPreferencial).toBe('visual')
  })

  it('ativa alvos maiores para toque com confirmacao', () => {
    const ajustes = criarAjustesIniciaisPerfilApoio({
      comunicacaoPreferencial: 'figuras',
      acessoPreferencial: 'toque-com-confirmacao',
      regulacaoPreferencial: 'alternar',
      limiteTentativasAntesPausa: 6,
      cartoesComunicacao: [],
      planoRegulacao: planoRegulacaoVazio,
      observacoes: '',
    })

    expect(ajustes.preferenciasSensoriais.alvosMaiores).toBe(true)
    expect(ajustes.planoIndividual.observacaoMediador).toContain(
      'Toque com confirma',
    )
  })

  it('reduz som e animacao quando ambiente calmo e a principal regulacao', () => {
    const ajustes = criarAjustesIniciaisPerfilApoio({
      comunicacaoPreferencial: 'fala',
      acessoPreferencial: 'toque-direto',
      regulacaoPreferencial: 'ambiente-calmo',
      limiteTentativasAntesPausa: 6,
      cartoesComunicacao: [],
      planoRegulacao: {
        sinaisPausa: 'cobre os ouvidos',
        estrategiasAjudam: 'fone e luz baixa',
        evitarDuranteSobrecarga: 'perguntas repetidas',
      },
      observacoes: 'cobre os ouvidos com sons repentinos',
    })

    expect(ajustes.preferenciasSensoriais).toMatchObject({
      som: false,
      animacoes: false,
      alvosMaiores: false,
    })
    expect(ajustes.planoIndividual.apoioPreferencial).toBe('verbal')
    expect(ajustes.planoIndividual.observacaoMediador).toContain(
      'cobre os ouvidos',
    )
  })

  it('descreve o perfil em linguagem funcional', () => {
    const descricao = descreverPerfilApoio({
      comunicacaoPreferencial: 'gestos',
      acessoPreferencial: 'toque-com-ajuda',
      regulacaoPreferencial: 'pausa',
      limiteTentativasAntesPausa: 6,
      cartoesComunicacao: [],
      planoRegulacao: {
        sinaisPausa: 'olha para a porta',
        estrategiasAjudam: '',
        evitarDuranteSobrecarga: '',
      },
      observacoes: '',
    })

    expect(descricao).toContain('Gestos, olhar ou apontar')
    expect(descricao).toContain('Toque com apoio do mediador')
    expect(descricao).toContain('Pausas combinadas')
    expect(descricao).toContain('Pausa sugerida a cada 6 respostas')
    expect(descricao).toContain('Sinal de pausa: olha para a porta')
  })

  it('normaliza cartoes de comunicacao em perfis antigos', () => {
    const perfilApoio = normalizarPerfilApoio({
      comunicacaoPreferencial: 'figuras',
    })

    expect(perfilApoio.cartoesComunicacao).toHaveLength(4)
    expect(perfilApoio.cartoesComunicacao[0].id).toBe('pausa')
    expect(perfilApoio.planoRegulacao).toEqual(planoRegulacaoVazio)
  })

  it('normaliza plano de regulacao individual com limites curtos', () => {
    const plano = normalizarPlanoRegulacao({
      sinaisPausa: ` ${'s'.repeat(LIMITE_TEXTO_PLANO_REGULACAO + 20)} `,
      estrategiasAjudam: 'fone e luz baixa',
      evitarDuranteSobrecarga: 42,
    } as unknown as Partial<PerfilApoio['planoRegulacao']>)

    expect(plano.sinaisPausa).toHaveLength(LIMITE_TEXTO_PLANO_REGULACAO)
    expect(plano.estrategiasAjudam).toBe('fone e luz baixa')
    expect(plano.evitarDuranteSobrecarga).toBe('')
  })

  it('limita valor extremo de pausa sugerida', () => {
    const perfilApoio = normalizarPerfilApoio({
      limiteTentativasAntesPausa: 99,
    })

    expect(perfilApoio.limiteTentativasAntesPausa).toBe(20)
  })

  it('substitui valores fora das listas permitidas por padroes seguros', () => {
    const perfilApoio = normalizarPerfilApoio({
      comunicacaoPreferencial: 'telepatia',
      acessoPreferencial: 'arrastar-mao',
      regulacaoPreferencial: 'cronometro',
      limiteTentativasAntesPausa: Number.POSITIVE_INFINITY,
      cartoesComunicacao: [null, { id: 'pausa', fala: 'Pausa agora' }],
      observacoes: ` ${'a'.repeat(LIMITE_OBSERVACOES_PERFIL_APOIO + 20)} `,
    } as unknown as Partial<PerfilApoio>)

    expect(perfilApoio.comunicacaoPreferencial).toBe('emergente')
    expect(perfilApoio.acessoPreferencial).toBe('toque-direto')
    expect(perfilApoio.regulacaoPreferencial).toBe('pausa')
    expect(perfilApoio.limiteTentativasAntesPausa).toBe(6)
    expect(perfilApoio.cartoesComunicacao).toHaveLength(4)
    expect(perfilApoio.cartoesComunicacao[0].fala).toBe('Pausa agora')
    expect(perfilApoio.observacoes).toHaveLength(
      LIMITE_OBSERVACOES_PERFIL_APOIO,
    )
  })

  it('mantem a observacao do mediador dentro do limite das regras', () => {
    const descricao = descreverPerfilApoio({
      comunicacaoPreferencial: 'figuras',
      acessoPreferencial: 'escolha-mediada',
      regulacaoPreferencial: 'alternar',
      limiteTentativasAntesPausa: 20,
      cartoesComunicacao: [],
      planoRegulacao: planoRegulacaoVazio,
      observacoes: 'x'.repeat(500),
    })

    expect(descricao.length).toBeLessThanOrEqual(LIMITE_OBSERVACAO_MEDIADOR)
  })
})
