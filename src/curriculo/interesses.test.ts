import { describe, expect, it } from 'vitest'
import type { Atividade } from './tipos'
import {
  exemplosInteresseEspecial,
  interesseEspecialIds,
  obterInteresseEspecial,
  palavraDeApoioPorInteresse,
  personalizarAtividadePorInteresse,
} from './interesses'

const atividadeSilaba: Atividade = {
  id: 'm4-MA',
  moduloId: 'm4',
  tipo: 'formacao-silaba',
  nivelDificuldade: 1,
  alvo: {
    id: 'silaba-MA',
    rotulo: 'MA',
    iconeId: 'letra-MA',
    audioTexto: 'MA, de mamãe',
  },
  resposta: {
    id: 'silaba-MA',
    rotulo: 'MA',
    iconeId: 'letra-MA',
    audioTexto: 'MA, de mamãe',
  },
  distratores: [
    {
      id: 'silaba-PA',
      rotulo: 'PA',
      iconeId: 'letra-PA',
      audioTexto: 'PA, de papai',
    },
  ],
  dicas: [],
  criteriosDominio: { acertosConsecutivosNecessarios: 1, janelaTentativas: 1 },
}

function criarAtividadeSilaba(silaba: string, distrator = 'MA'): Atividade {
  const estimulo = {
    id: `silaba-${silaba}`,
    rotulo: silaba,
    iconeId: `letra-${silaba}`,
    audioTexto: `${silaba}, de apoio`,
  }

  return {
    ...atividadeSilaba,
    id: `m4-${silaba}`,
    alvo: estimulo,
    resposta: estimulo,
    distratores: [
      {
        id: `silaba-${distrator}`,
        rotulo: distrator,
        iconeId: `letra-${distrator}`,
        audioTexto: `${distrator}, de apoio`,
      },
    ],
  }
}

describe('personalizarAtividadePorInteresse', () => {
  it('mantém a atividade intacta no tema neutro', () => {
    expect(personalizarAtividadePorInteresse(atividadeSilaba, 'neutro')).toBe(
      atividadeSilaba,
    )
  })

  it('troca palavras de apoio sem mudar os ids de resposta', () => {
    const personalizada = personalizarAtividadePorInteresse(
      atividadeSilaba,
      'animais',
    )

    expect(personalizada.resposta.id).toBe('silaba-MA')
    expect(personalizada.resposta.audioTexto).toBe('MA, de macaco')
    expect(personalizada.distratores[0].audioTexto).toBe('PA, de pato')
  })

  it('inclui temas variados para interesses fortes sem alterar a tarefa', () => {
    expect(interesseEspecialIds).toEqual([
      'neutro',
      'animais',
      'veiculos',
      'casa',
      'musica',
      'comida',
      'brincar',
      'natureza',
    ])

    const musical = personalizarAtividadePorInteresse(atividadeSilaba, 'musica')

    expect(musical.resposta.id).toBe('silaba-MA')
    expect(musical.resposta.audioTexto).toBe('MA, de maraca')
    expect(exemplosInteresseEspecial('musica')).toEqual([
      'MA de maraca',
      'PA de pandeiro',
    ])
  })

  it('personaliza silabas novas com vogais A E I O U quando ha palavra segura', () => {
    expect(palavraDeApoioPorInteresse('casa', 'ME')).toBe('mesa')
    expect(palavraDeApoioPorInteresse('comida', 'PU')).toBe('pudim')
    expect(palavraDeApoioPorInteresse('natureza', 'PO')).toBe('pôr do sol')
    expect(palavraDeApoioPorInteresse('veiculos', 'BU')).toBe('bugue')
    expect(palavraDeApoioPorInteresse('neutro', 'MU')).toBeNull()

    const atividadeMU = criarAtividadeSilaba('MU', 'BE')
    const personalizada = personalizarAtividadePorInteresse(
      atividadeMU,
      'musica',
    )

    expect(personalizada.resposta.id).toBe('silaba-MU')
    expect(personalizada.resposta.audioTexto).toBe('MU, de música')
    expect(personalizada.distratores[0].audioTexto).toBe('BE, de berimbau')
  })

  it('mantem a palavra padrao quando o tema nao tem alternativa adequada', () => {
    const atividadePU = criarAtividadeSilaba('PU')
    const personalizada = personalizarAtividadePorInteresse(
      atividadePU,
      'veiculos',
    )

    expect(personalizada.resposta.audioTexto).toBe('PU, de apoio')
    expect(personalizada.distratores[0].audioTexto).toBe('MA, de máquina')
  })

  it('descreve o interesse selecionado para apoiar a escolha do adulto', () => {
    expect(obterInteresseEspecial('natureza')).toEqual(
      expect.objectContaining({
        nome: 'Natureza',
        descricao: expect.stringContaining('elementos naturais'),
      }),
    )
  })
})
