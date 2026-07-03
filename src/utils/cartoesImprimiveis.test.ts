import { describe, expect, it } from 'vitest'
import { normalizarCartoesComunicacao } from '../curriculo/cartoesComunicacao'
import { criarRelatorioProgresso } from '../curriculo/relatorioProgresso'
import { trilhaV1 } from '../curriculo/trilha-v1'
import type { PerfilCrianca } from '../firebase/perfis'
import {
  criarCartoesImprimiveis,
  nomeArquivoCartoesImprimiveis,
} from './cartoesImprimiveis'

const perfil: PerfilCrianca = {
  id: 'perfil-1',
  nome: 'Lia Vitória',
  avatarId: 'estrela',
  interesseEspecialId: 'neutro',
  perfilApoio: {
    comunicacaoPreferencial: 'figuras',
    acessoPreferencial: 'escolha-mediada',
    regulacaoPreferencial: 'pausa',
    limiteTentativasAntesPausa: 6,
    cartoesComunicacao: normalizarCartoesComunicacao([
      {
        id: 'ajuda',
        rotulo: 'Ajuda',
        fala: 'Mostra <de novo> & espera.',
        apoio: 'Apontar uma "opção" por vez.',
      },
    ]),
    planoRegulacao: {
      sinaisPausa: 'olha para a porta',
      estrategiasAjudam: 'fone <baixo> & luz baixa',
      evitarDuranteSobrecarga: 'perguntas repetidas',
    },
    observacoes: '',
  },
  preferenciasSensoriais: {
    som: true,
    animacoes: false,
    altoContraste: false,
    alvosMaiores: true,
    tamanhoFonte: 'grande',
  },
  planoIndividual: {
    metaAtual: 'pedir pausa antes de sair',
    apoioPreferencial: 'pausa',
    observacaoMediador: 'esperar resposta por olhar',
  },
  atividadesDominadas: ['m0-n1-a1'],
}

function idsDominadasSemModulo(moduloId: string): string[] {
  return trilhaV1.modulos
    .filter((modulo) => modulo.id !== moduloId)
    .flatMap((modulo) => modulo.atividades.map((atividade) => atividade.id))
}

describe('cartoesImprimiveis', () => {
  it('gera nome de arquivo html estavel sem expor nome da crianca', () => {
    const nome = nomeArquivoCartoesImprimiveis(
      perfil,
      new Date('2026-07-02T12:00:00Z'),
    )

    expect(nome).toBe('tea-cartoes-pratica-2026-07-02.html')
    expect(nome).not.toContain('lia')
    expect(nome).not.toContain('vitoria')
  })

  it('gera html imprimivel com atividade, rotina e comunicacao', () => {
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      perfil.atividadesDominadas,
      [],
      perfil.planoIndividual,
    )

    const html = criarCartoesImprimiveis({
      perfil,
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(html).toContain('<!doctype html>')
    expect(html).toContain('Cartões de prática - Lia Vitória')
    expect(html).toContain('Habilidade-alvo')
    expect(html).toContain('estrela')
    expect(html).toContain('Roteiro visual')
    expect(html).toContain('Gabarito para o mediador: estrela.')
    expect(html).toContain('Pausa/regulação sugerida:')
    expect(html).toContain('Esta pausa faz parte da atividade.')
    expect(html).toContain('<strong>Sinal de pausa:</strong> olha para a porta')
    expect(html).toContain('fone &lt;baixo&gt; &amp; luz baixa')
    expect(html).toContain('<strong class="symbol">II</strong>')
    expect(html).toContain('<strong class="symbol">+</strong>')
    expect(html).toContain('<strong class="symbol">?</strong>')
    expect(html).toContain('<strong class="symbol">OK</strong>')
    expect(html).toContain('Mostra &lt;de novo&gt; &amp; espera.')
    expect(html).toContain('Apontar uma &quot;opção&quot; por vez.')
    expect(html).not.toContain('Mostra <de novo>')
  })

  it('inclui motivo visual do interesse nos cartoes de comunicacao impressos', () => {
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      perfil.atividadesDominadas,
      [],
      perfil.planoIndividual,
    )

    const html = criarCartoesImprimiveis({
      perfil: {
        ...perfil,
        interesseEspecialId: 'natureza',
      },
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(html).toContain(
      '<strong class="symbol">II<span class="interest-motif" aria-hidden="true">🌿</span></strong>',
    )
    expect(html).toContain(
      '<strong class="symbol">+<span class="interest-motif" aria-hidden="true">🌿</span></strong>',
    )
  })

  it('adapta roteiro impresso e pausa sugerida para regulacao por movimento', () => {
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      perfil.atividadesDominadas,
      [],
      perfil.planoIndividual,
    )

    const html = criarCartoesImprimiveis({
      perfil: {
        ...perfil,
        perfilApoio: {
          ...perfil.perfilApoio,
          regulacaoPreferencial: 'movimento',
        },
      },
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(html).toContain(
      '<small>Movimento</small><strong>Pode mover</strong>',
    )
    expect(html).toContain('Pode mover o corpo com seguranca.')
  })
  it('gera instrucao imprimivel para texto curto literal', () => {
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      idsDominadasSemModulo('m8'),
      [],
      perfil.planoIndividual,
    )

    const html = criarCartoesImprimiveis({
      perfil,
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(html).toContain('A MALA. A BALA.')
    expect(html).toContain('Leia o texto curto')
    expect(html).toContain('Gabarito para o mediador: MALA.')
  })

  it('inclui pergunta literal nos cartoes imprimiveis', () => {
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      idsDominadasSemModulo('m9'),
      [],
      perfil.planoIndividual,
    )

    const html = criarCartoesImprimiveis({
      perfil,
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(html).toContain('A MALA. A BALA.')
    expect(html).toContain('O que apareceu primeiro?')
    expect(html).toContain('<small>Pergunta</small>')
    expect(html).toContain('Gabarito para o mediador: MALA.')
  })

  it('inclui pergunta de presenca/ausencia nos cartoes imprimiveis', () => {
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      idsDominadasSemModulo('m10'),
      [],
      perfil.planoIndividual,
    )

    const html = criarCartoesImprimiveis({
      perfil,
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(html).toContain('A MALA. A BALA.')
    expect(html).toContain('Qual palavra apareceu no texto?')
    expect(html).toContain('Gabarito para o mediador: MALA.')
  })
})
