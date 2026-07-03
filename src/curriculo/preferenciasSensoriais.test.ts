import { describe, expect, it } from 'vitest'
import { normalizarPreferenciasSensoriais } from './preferenciasSensoriais'

describe('normalizarPreferenciasSensoriais', () => {
  it('mantem apenas booleanos e tamanhos de fonte permitidos', () => {
    const preferencias = normalizarPreferenciasSensoriais({
      som: 'sim',
      animacoes: false,
      altoContraste: true,
      alvosMaiores: 'true',
      tamanhoFonte: 'gigante',
    } as never)

    expect(preferencias).toEqual({
      som: true,
      animacoes: false,
      altoContraste: true,
      alvosMaiores: false,
      tamanhoFonte: 'normal',
    })
  })

  it('usa o padrao informado para valores invalidos', () => {
    const preferencias = normalizarPreferenciasSensoriais(
      {
        som: null,
        tamanhoFonte: 'mini',
      } as never,
      {
        som: false,
        animacoes: false,
        altoContraste: true,
        alvosMaiores: true,
        tamanhoFonte: 'grande',
      },
    )

    expect(preferencias).toEqual({
      som: false,
      animacoes: false,
      altoContraste: true,
      alvosMaiores: true,
      tamanhoFonte: 'grande',
    })
  })
})
