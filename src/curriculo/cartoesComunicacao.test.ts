import { describe, expect, it } from 'vitest'
import {
  atualizarCartaoComunicacao,
  motivoComunicacaoPorInteresse,
  normalizarCartoesComunicacao,
  simbolosCartaoComunicacao,
} from './cartoesComunicacao'

describe('cartoesComunicacao', () => {
  it('mantem simbolos visuais estaveis para CAA basica', () => {
    expect(simbolosCartaoComunicacao).toEqual({
      pausa: 'II',
      ajuda: '+',
      'nao-sei': '?',
      pronto: 'OK',
    })
  })

  it('oferece motivo visual complementar por interesse sem alterar o modo neutro', () => {
    expect(motivoComunicacaoPorInteresse('neutro')).toBeNull()
    expect(motivoComunicacaoPorInteresse()).toBeNull()
    expect(motivoComunicacaoPorInteresse('animais')).toEqual({
      simbolo: '🐾',
      rotulo: 'animais',
    })
    expect(motivoComunicacaoPorInteresse('musica')).toEqual({
      simbolo: '♪',
      rotulo: 'música',
    })
  })

  it('preenche cartoes ausentes com padroes seguros', () => {
    const cartoes = normalizarCartoesComunicacao([
      { id: 'pausa', rotulo: 'Parar', fala: 'Quero parar.' },
    ])

    expect(cartoes).toHaveLength(4)
    expect(cartoes[0]).toMatchObject({
      id: 'pausa',
      rotulo: 'Parar',
      fala: 'Quero parar.',
      apoio: 'Respirar, levantar ou voltar depois.',
    })
    expect(cartoes[1]).toMatchObject({
      id: 'ajuda',
      rotulo: 'Ajuda',
    })
  })

  it('ignora texto vazio e limita campos longos', () => {
    const cartoes = normalizarCartoesComunicacao([
      {
        id: 'ajuda',
        rotulo: '   ',
        fala: 'a'.repeat(120),
        apoio: 'b'.repeat(200),
      },
    ])

    const ajuda = cartoes.find((cartao) => cartao.id === 'ajuda')

    expect(ajuda?.rotulo).toBe('Ajuda')
    expect(ajuda?.fala).toHaveLength(90)
    expect(ajuda?.apoio).toHaveLength(140)
  })

  it('atualiza um campo mantendo os demais cartoes normalizados', () => {
    const cartoes = atualizarCartaoComunicacao(
      undefined,
      'nao-sei',
      'rotulo',
      'Dificil',
    )

    expect(cartoes.find((cartao) => cartao.id === 'nao-sei')?.rotulo).toBe(
      'Dificil',
    )
    expect(cartoes.find((cartao) => cartao.id === 'pausa')?.rotulo).toBe(
      'Pausa',
    )
  })
})
