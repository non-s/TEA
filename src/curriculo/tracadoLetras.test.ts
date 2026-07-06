import { describe, expect, it } from 'vitest'
import { avaliarTracado, guiasLetras, possuiGuiaTracado } from './tracadoLetras'

const guiaSegmentoUnico = [
  [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
  ],
]

describe('possuiGuiaTracado', () => {
  it('reconhece as 10 letras usadas na trilha, maiúsculas ou minúsculas', () => {
    for (const letra of ['A', 'E', 'I', 'O', 'U', 'M', 'P', 'T', 'L', 'B']) {
      expect(possuiGuiaTracado(letra)).toBe(true)
      expect(possuiGuiaTracado(letra.toLowerCase())).toBe(true)
    }
  })

  it('nao reconhece letras fora do conjunto inicial', () => {
    expect(possuiGuiaTracado('C')).toBe(false)
  })
})

describe('avaliarTracado', () => {
  it('reprova quando nada foi desenhado', () => {
    const resultado = avaliarTracado([], guiaSegmentoUnico)
    expect(resultado).toEqual({ precisao: 0, cobertura: 0, aprovado: false })
  })

  it('aprova um traço que segue o guia de ponta a ponta', () => {
    const tracoFiel = [
      Array.from({ length: 21 }, (_, i) => ({ x: i * 5, y: 0 })),
    ]
    const resultado = avaliarTracado(tracoFiel, guiaSegmentoUnico)
    expect(resultado.precisao).toBe(1)
    expect(resultado.cobertura).toBe(1)
    expect(resultado.aprovado).toBe(true)
  })

  it('reprova por precisao quando o traço fica longe do guia', () => {
    const tracoDistante = [
      Array.from({ length: 21 }, (_, i) => ({ x: i * 5, y: 60 })),
    ]
    const resultado = avaliarTracado(tracoDistante, guiaSegmentoUnico, {
      tolerancia: 10,
    })
    expect(resultado.precisao).toBe(0)
    expect(resultado.aprovado).toBe(false)
  })

  it('reprova por cobertura quando só uma ponta do guia foi tocada', () => {
    const soAPonta = [[{ x: 0, y: 0 }]]
    const resultado = avaliarTracado(soAPonta, guiaSegmentoUnico, {
      tolerancia: 10,
    })
    expect(resultado.precisao).toBe(1)
    expect(resultado.cobertura).toBeLessThan(0.5)
    expect(resultado.aprovado).toBe(false)
  })

  it('aceita multiplos traços separados (letras como T ou E)', () => {
    const guiaDoT = guiasLetras.T
    const tracosFieis = guiaDoT.map((traco) => {
      const [inicio, fim] = traco
      return Array.from({ length: 11 }, (_, i) => ({
        x: inicio.x + ((fim.x - inicio.x) * i) / 10,
        y: inicio.y + ((fim.y - inicio.y) * i) / 10,
      }))
    })
    const resultado = avaliarTracado(tracosFieis, guiaDoT)
    expect(resultado.aprovado).toBe(true)
  })

  it('respeita limiares customizados de precisao e cobertura', () => {
    const tracoParcial = [
      Array.from({ length: 11 }, (_, i) => ({ x: i * 5, y: 0 })),
    ]
    const resultadoPermissivo = avaliarTracado(
      tracoParcial,
      guiaSegmentoUnico,
      {
        coberturaMinima: 0.3,
      },
    )
    expect(resultadoPermissivo.aprovado).toBe(true)

    const resultadoExigente = avaliarTracado(tracoParcial, guiaSegmentoUnico, {
      coberturaMinima: 0.9,
    })
    expect(resultadoExigente.aprovado).toBe(false)
  })
})
