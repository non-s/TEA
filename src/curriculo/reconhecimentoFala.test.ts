import { describe, expect, it } from 'vitest'
import { falaCorrespondeResposta, normalizarFala } from './reconhecimentoFala'

describe('normalizarFala', () => {
  it('remove acentos, pontuacao e normaliza espacos', () => {
    expect(normalizarFala('É, ELE!')).toBe('e ele')
    expect(normalizarFala('  eme  ')).toBe('eme')
    expect(normalizarFala('')).toBe('')
  })
})

describe('falaCorrespondeResposta', () => {
  it('aceita a resposta falada isoladamente', () => {
    expect(falaCorrespondeResposta('eme', ['eme'])).toBe(true)
    expect(falaCorrespondeResposta('EME', ['eme'])).toBe(true)
  })

  it('aceita a resposta como uma palavra dentro de uma frase maior', () => {
    expect(falaCorrespondeResposta('é eme', ['eme'])).toBe(true)
    expect(falaCorrespondeResposta('letra eme de mala', ['eme'])).toBe(true)
  })

  it('aceita qualquer uma das respostas de uma lista', () => {
    expect(falaCorrespondeResposta('pe', ['eme', 'pe', 'te'])).toBe(true)
  })

  it('rejeita quando nao ha correspondencia de palavra completa', () => {
    expect(falaCorrespondeResposta('pe', ['eme'])).toBe(false)
    expect(falaCorrespondeResposta('', ['eme'])).toBe(false)
  })

  it('nunca aceita por substring livre (alvo curto nao deve casar com qualquer frase)', () => {
    // "i" não deve corresponder por estar contido em "sei", "assim" etc.
    expect(falaCorrespondeResposta('eu sei que e assim', ['i'])).toBe(false)
    expect(falaCorrespondeResposta('e', ['i'])).toBe(false)
  })

  it('aceita o alvo curto quando falado como palavra isolada', () => {
    expect(falaCorrespondeResposta('i', ['i'])).toBe(true)
    expect(falaCorrespondeResposta('a letra i', ['i'])).toBe(true)
  })
})
