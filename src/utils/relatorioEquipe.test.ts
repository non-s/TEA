import { describe, expect, it } from 'vitest'
import { normalizarCartoesComunicacao } from '../curriculo/cartoesComunicacao'
import { criarRelatorioProgresso } from '../curriculo/relatorioProgresso'
import { trilhaV1 } from '../curriculo/trilha-v1'
import type { PerfilCrianca } from '../firebase/perfis'
import {
  criarRelatorioEquipe,
  nomeArquivoRelatorioEquipe,
} from './relatorioEquipe'

const perfil: PerfilCrianca = {
  id: 'perfil-1',
  nome: 'Lia Vitória',
  avatarId: 'estrela',
  interesseEspecialId: 'animais',
  perfilApoio: {
    comunicacaoPreferencial: 'figuras',
    acessoPreferencial: 'escolha-mediada',
    regulacaoPreferencial: 'pausa',
    limiteTentativasAntesPausa: 6,
    cartoesComunicacao: normalizarCartoesComunicacao([
      {
        id: 'ajuda',
        rotulo: 'Mostra',
        fala: 'Mostra de novo.',
        apoio: 'Apontar uma opcao por vez.',
      },
    ]),
    planoRegulacao: {
      sinaisPausa: 'olha para a porta',
      estrategiasAjudam: 'fone e luz baixa',
      evitarDuranteSobrecarga: 'muitas perguntas',
    },
    observacoes: 'usa prancha em casa',
  },
  preferenciasSensoriais: {
    som: true,
    animacoes: false,
    altoContraste: false,
    alvosMaiores: true,
    tamanhoFonte: 'grande',
  },
  planoIndividual: {
    metaAtual: 'pedir pausa antes de sair da atividade',
    apoioPreferencial: 'pausa',
    observacaoMediador: 'esperar resposta por olhar',
  },
  atividadesDominadas: ['m0-n1-a1'],
  colaboradoresEmail: [],
}

describe('relatorioEquipe', () => {
  it('gera nome de arquivo estavel sem expor nome da crianca', () => {
    const nome = nomeArquivoRelatorioEquipe(
      perfil,
      new Date('2026-07-02T12:00:00Z'),
    )

    expect(nome).toBe('tea-relatorio-equipe-2026-07-02.md')
    expect(nome).not.toContain('lia')
    expect(nome).not.toContain('vitoria')
  })

  it('gera resumo compartilhavel para equipe', () => {
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

    const markdown = criarRelatorioEquipe({
      perfil,
      relatorio,
      observacoesSessao: [
        {
          id: 'obs-1',
          tipo: 'regulacao',
          texto: 'pediu pausa no começo',
          timestamp: 10,
        },
      ],
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(markdown).toContain('# Relatorio para equipe - Lia Vitória')
    expect(markdown).toContain('Perfil funcional de apoio')
    expect(markdown).toContain('Apoio graduado')
    expect(markdown).toContain('Escolha por olhar/gesto e mediador toca')
    expect(markdown).toContain('Pausa sugerida: a cada 6 respostas')
    expect(markdown).toContain('Sinal de pausa: olha para a porta')
    expect(markdown).toContain('Ajuda a regular: fone e luz baixa')
    expect(markdown).toContain('## Guia rapido do mediador')
    expect(markdown).toContain(
      '**Durante**: Mostre uma opcao por vez e toque somente depois do sinal combinado.',
    )
    expect(markdown).toContain(
      '**Depois**: Registre se "esperar resposta por olhar" ajudou hoje.',
    )
    expect(markdown).toContain('- Mostra: "Mostra de novo."')
    expect(markdown).toContain('Modulo | Status | Dominadas')
    expect(markdown).toContain('[Regulacao]: pediu pausa no começo')
    expect(markdown).toContain('nao substitui avaliacao clinica')
  })
})
