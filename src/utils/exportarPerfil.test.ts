import { describe, expect, it } from 'vitest'
import { criarRelatorioProgresso } from '../curriculo/relatorioProgresso'
import { trilhaV1 } from '../curriculo/trilha-v1'
import { normalizarCartoesComunicacao } from '../curriculo/cartoesComunicacao'
import type { PerfilCrianca } from '../firebase/perfis'
import {
  criarExportacaoPerfil,
  nomeArquivoExportacaoPerfil,
} from './exportarPerfil'

const perfil: PerfilCrianca = {
  id: 'perfil-1',
  nome: 'Lia Vitória',
  avatarId: 'estrela',
  interesseEspecialId: 'animais',
  perfilApoio: {
    comunicacaoPreferencial: 'figuras',
    acessoPreferencial: 'toque-com-ajuda',
    regulacaoPreferencial: 'pausa',
    limiteTentativasAntesPausa: 6,
    cartoesComunicacao: normalizarCartoesComunicacao(),
    planoRegulacao: {
      sinaisPausa: 'olha para a porta',
      estrategiasAjudam: 'respirar com fone',
      evitarDuranteSobrecarga: 'muitas perguntas',
    },
    observacoes: 'usa figuras para pedir ajuda',
  },
  preferenciasSensoriais: {
    som: true,
    animacoes: false,
    altoContraste: false,
    alvosMaiores: true,
    tamanhoFonte: 'grande',
  },
  planoIndividual: {
    metaAtual: 'pedir pausa',
    apoioPreferencial: 'pausa',
    observacaoMediador: 'volta melhor depois de respirar',
  },
  atividadesDominadas: ['m0-n1-a1'],
}

describe('exportarPerfil', () => {
  it('gera nome de arquivo estavel sem expor nome da crianca', () => {
    const nome = nomeArquivoExportacaoPerfil(
      perfil,
      new Date('2026-07-02T12:00:00Z'),
    )

    expect(nome).toBe('tea-dados-perfil-2026-07-02.json')
    expect(nome).not.toContain('lia')
    expect(nome).not.toContain('vitoria')
  })

  it('inclui perfil, resumo, tentativas e observacoes de sessao', () => {
    const tentativa = {
      atividadeId: 'm0-n1-a1',
      moduloId: 'm0',
      timestamp: 10,
      resultado: 'correto' as const,
      nivelDicaUsado: 2,
      tempoRespostaMs: 1200,
    }
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      perfil.atividadesDominadas,
      [tentativa],
      perfil.planoIndividual,
    )

    const exportacao = criarExportacaoPerfil({
      perfil,
      relatorio,
      tentativas: [tentativa],
      observacoesSessao: [
        {
          id: 'obs-1',
          tipo: 'regulacao',
          texto: 'pediu pausa no começo',
          timestamp: 20,
        },
      ],
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(exportacao.versao).toBe(1)
    expect(exportacao.perfil.nome).toBe('Lia Vitória')
    expect(exportacao.perfil.perfilApoio.planoRegulacao.sinaisPausa).toBe(
      'olha para a porta',
    )
    expect(exportacao.resumo.totalDominadas).toBe(1)
    expect(exportacao.tentativas).toHaveLength(1)
    expect(exportacao.observacoesSessao[0].tipo).toBe('regulacao')
    expect(exportacao.observacoesSessao[0].texto).toBe('pediu pausa no começo')
  })
})
