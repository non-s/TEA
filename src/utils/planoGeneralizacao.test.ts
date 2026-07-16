import { describe, expect, it } from 'vitest'
import { normalizarCartoesComunicacao } from '../curriculo/cartoesComunicacao'
import { criarRelatorioProgresso } from '../curriculo/relatorioProgresso'
import { trilhaV1 } from '../curriculo/trilha-v1'
import type { PerfilCrianca } from '../firebase/perfis'
import {
  criarPlanoGeneralizacao,
  nomeArquivoPlanoGeneralizacao,
} from './planoGeneralizacao'

const perfil: PerfilCrianca = {
  id: 'perfil-1',
  nome: 'Lia Vitoria',
  avatarId: 'estrela',
  interesseEspecialId: 'neutro',
  perfilApoio: {
    comunicacaoPreferencial: 'figuras',
    acessoPreferencial: 'escolha-mediada',
    regulacaoPreferencial: 'pausa',
    limiteTentativasAntesPausa: 6,
    cartoesComunicacao: normalizarCartoesComunicacao([
      {
        id: 'pausa',
        rotulo: 'Pausa',
        fala: 'Preciso de pausa.',
        apoio: 'Abrir pausa antes de insistir.',
      },
    ]),
    planoRegulacao: {
      sinaisPausa: 'olha para a porta',
      estrategiasAjudam: 'fone e luz baixa',
      evitarDuranteSobrecarga: 'perguntas repetidas',
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
    metaAtual: 'usar pausa antes de abandonar a mesa',
    apoioPreferencial: 'pausa',
    observacaoMediador: 'esperar resposta por olhar',
  },
  atividadesDominadas: ['m0-n1-a1'],
  colaboradoresEmail: [],
}

function idsDominadasSemModulo(moduloId: string): string[] {
  return trilhaV1.modulos
    .filter((modulo) => modulo.id !== moduloId)
    .flatMap((modulo) => modulo.atividades.map((atividade) => atividade.id))
}

function idsDominadasExcetoPrefixo(prefixoId: string): string[] {
  return trilhaV1.modulos
    .flatMap((modulo) => modulo.atividades)
    .filter((atividade) => !atividade.id.startsWith(prefixoId))
    .map((atividade) => atividade.id)
}

describe('planoGeneralizacao', () => {
  it('gera nome de arquivo estavel sem expor nome da crianca', () => {
    const nome = nomeArquivoPlanoGeneralizacao(
      perfil,
      new Date('2026-07-02T12:00:00Z'),
    )

    expect(nome).toBe('tea-plano-generalizacao-2026-07-02.md')
    expect(nome).not.toContain('lia')
    expect(nome).not.toContain('vitoria')
  })

  it('gera plano para praticar a proxima habilidade fora da tela', () => {
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      perfil.atividadesDominadas,
      [],
      perfil.planoIndividual,
    )

    const markdown = criarPlanoGeneralizacao({
      perfil,
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(markdown).toContain('# Plano de generalização - Lia Vitoria')
    expect(markdown).toContain('Foco: estrela')
    expect(markdown).toContain('Objetivo fora da tela')
    expect(markdown).toContain('Escolha por olhar/gesto e mediador toca')
    expect(markdown).toContain('Pausa: oferecer antes de fadiga')
    expect(markdown).toContain('Ajuda a regular: fone e luz baixa')
    expect(markdown).toContain('## Guia rapido do mediador')
    expect(markdown).toContain(
      'Meta: usar pausa antes de abandonar a mesa. Agora: estrela.',
    )
    expect(markdown).toContain(
      '**Antes**: Deixe os cartoes visuais e a pausa ao alcance.',
    )
    expect(markdown).toContain('- Pausa: "Preciso de pausa."')
    expect(markdown).toContain('Generalizou a habilidade')
    expect(markdown).toContain('não substitui avaliação clínica')
  })

  it('orienta generalizacao de leitura de frase quando esse for o proximo passo', () => {
    const dominadasAtePalavras = idsDominadasSemModulo('m6')
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      dominadasAtePalavras,
      [],
      perfil.planoIndividual,
    )

    const markdown = criarPlanoGeneralizacao({
      perfil: {
        ...perfil,
        atividadesDominadas: dominadasAtePalavras,
      },
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(markdown).toContain('Foco: A MALA')
    expect(markdown).toContain('Ler uma frase curta')
    expect(markdown).toContain('Cartão da frase "A MALA"')
    expect(markdown).toContain('leitura silenciosa')
  })

  it('orienta compreensao de frase quando esse for o proximo passo', () => {
    const dominadasAteFrases = idsDominadasSemModulo('m7')
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      dominadasAteFrases,
      [],
      perfil.planoIndividual,
    )

    const markdown = criarPlanoGeneralizacao({
      perfil: {
        ...perfil,
        atividadesDominadas: dominadasAteFrases,
      },
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(markdown).toContain('Foco: A MALA')
    expect(markdown).toContain('Compreender uma frase curta')
    expect(markdown).toContain('Cartões das palavras possíveis')
    expect(markdown).toContain('mostrar compreensão')
  })
  it('orienta compreensao de texto curto quando esse for o proximo passo', () => {
    const dominadasAteCompreensaoFrases = idsDominadasSemModulo('m8')
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      dominadasAteCompreensaoFrases,
      [],
      perfil.planoIndividual,
    )

    const markdown = criarPlanoGeneralizacao({
      perfil: {
        ...perfil,
        atividadesDominadas: dominadasAteCompreensaoFrases,
      },
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(markdown).toContain('Foco: A MALA. A BALA.')
    expect(markdown).toContain('texto de duas frases')
    expect(markdown).toContain('texto curto')
    expect(markdown).toContain('palavra que apareceu')
  })

  it('orienta pergunta literal sobre texto quando esse for o proximo passo', () => {
    const dominadasAteTextos = idsDominadasSemModulo('m9')
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      dominadasAteTextos,
      [],
      perfil.planoIndividual,
    )

    const markdown = criarPlanoGeneralizacao({
      perfil: {
        ...perfil,
        atividadesDominadas: dominadasAteTextos,
      },
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(markdown).toContain('Foco: A MALA. A BALA.')
    expect(markdown).toContain('Responder uma pergunta literal')
    expect(markdown).toContain('O que apareceu primeiro?')
    expect(markdown).toContain('primeiro ou depois')
  })

  it('orienta pergunta de presenca/ausencia quando esse for o proximo passo', () => {
    const dominadasAtePerguntasLiterais = idsDominadasExcetoPrefixo('m9-presenca-')
    const relatorio = criarRelatorioProgresso(
      trilhaV1,
      dominadasAtePerguntasLiterais,
      [],
      perfil.planoIndividual,
    )

    const markdown = criarPlanoGeneralizacao({
      perfil: {
        ...perfil,
        atividadesDominadas: dominadasAtePerguntasLiterais,
      },
      relatorio,
      geradoEm: '2026-07-02T12:00:00.000Z',
    })

    expect(markdown).toContain('Qual palavra apareceu no texto?')
    expect(markdown).toContain('apareceu ou não apareceu')
    expect(markdown).toContain('separando as que aparecem')
  })
})
