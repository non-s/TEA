import { describe, expect, it } from 'vitest'
import { calcularJardim, contarFlorescidas } from './jardim'
import { trilhaV1 } from './trilha-v1'
import type { Trilha } from './tipos'

const trilhaFicticia: Trilha = {
  versao: 'teste',
  modulos: [
    {
      id: 'x0',
      titulo: 'Módulo X0',
      descricao: '',
      ordem: 0,
      atividades: [{ id: 'x0-a1' } as never, { id: 'x0-a2' } as never],
    },
    {
      id: 'x1',
      titulo: 'Módulo X1',
      descricao: '',
      ordem: 1,
      atividades: [{ id: 'x1-a1' } as never],
    },
  ],
}

describe('calcularJardim', () => {
  it('começa toda em estágio semente sem nenhuma atividade dominada', () => {
    const canteiros = calcularJardim(trilhaFicticia, new Set())
    expect(canteiros).toEqual([
      {
        moduloId: 'x0',
        titulo: 'Módulo X0',
        concluidas: 0,
        total: 2,
        percentual: 0,
        estagio: 'semente',
      },
      {
        moduloId: 'x1',
        titulo: 'Módulo X1',
        concluidas: 0,
        total: 1,
        percentual: 0,
        estagio: 'semente',
      },
    ])
  })

  it('brota quando parte das atividades do módulo foi dominada', () => {
    const canteiros = calcularJardim(trilhaFicticia, new Set(['x0-a1']))
    expect(canteiros[0]).toMatchObject({
      concluidas: 1,
      percentual: 50,
      estagio: 'brotando',
    })
    expect(canteiros[1]).toMatchObject({ estagio: 'semente' })
  })

  it('floresce quando todas as atividades do módulo foram dominadas', () => {
    const canteiros = calcularJardim(
      trilhaFicticia,
      new Set(['x0-a1', 'x0-a2']),
    )
    expect(canteiros[0]).toMatchObject({
      percentual: 100,
      estagio: 'floresceu',
    })
    expect(canteiros[1]).toMatchObject({ estagio: 'semente' })
  })

  it('nunca floresce por dominar atividades de outro módulo', () => {
    const canteiros = calcularJardim(
      trilhaFicticia,
      new Set(['x1-a1', 'algo-inexistente']),
    )
    expect(canteiros[0]).toMatchObject({ estagio: 'semente', concluidas: 0 })
    expect(canteiros[1]).toMatchObject({ estagio: 'floresceu', concluidas: 1 })
  })

  it('produz um canteiro por módulo real da trilha v1', () => {
    const canteiros = calcularJardim(trilhaV1, new Set())
    expect(canteiros).toHaveLength(trilhaV1.modulos.length)
    expect(canteiros.every((c) => c.total > 0)).toBe(true)
  })
})

describe('contarFlorescidas', () => {
  it('conta só os canteiros totalmente dominados', () => {
    const canteiros = calcularJardim(
      trilhaFicticia,
      new Set(['x0-a1', 'x0-a2']),
    )
    expect(contarFlorescidas(canteiros)).toBe(1)
  })

  it('retorna zero quando nada foi dominado', () => {
    expect(contarFlorescidas(calcularJardim(trilhaFicticia, new Set()))).toBe(0)
  })
})
