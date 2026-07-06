import type { Trilha } from './tipos'

export type EstagioPlanta = 'semente' | 'brotando' | 'floresceu'

export interface CanteiroJardim {
  moduloId: string
  titulo: string
  concluidas: number
  total: number
  percentual: number
  estagio: EstagioPlanta
}

function estagioParaPercentual(percentual: number): EstagioPlanta {
  if (percentual >= 100) return 'floresceu'
  if (percentual > 0) return 'brotando'
  return 'semente'
}

/**
 * Um canteiro por módulo da trilha — nunca por atividade individual, para
 * o jardim caber na tela sem virar uma lista de pontuação. Cada módulo
 * "floresce" quando todas as suas atividades estão dominadas; sem
 * comparação entre crianças, sem tempo, sem ranking (ver docs/PEDAGOGIA.md).
 */
export function calcularJardim(
  trilha: Trilha,
  dominadas: Set<string>,
): CanteiroJardim[] {
  return trilha.modulos.map((modulo) => {
    const total = modulo.atividades.length
    const concluidas = modulo.atividades.filter((atividade) =>
      dominadas.has(atividade.id),
    ).length
    const percentual = total === 0 ? 0 : Math.round((concluidas / total) * 100)

    return {
      moduloId: modulo.id,
      titulo: modulo.titulo,
      concluidas,
      total,
      percentual,
      estagio: estagioParaPercentual(percentual),
    }
  })
}

export function contarFlorescidas(canteiros: CanteiroJardim[]): number {
  return canteiros.filter((canteiro) => canteiro.estagio === 'floresceu').length
}
