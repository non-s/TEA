import { encontrarProximaAtividadeDisponivel } from './progressao'
import type { Atividade, Trilha } from './tipos'

export function encontrarProximaAtividadeAposConclusao(
  trilha: Trilha,
  atividadesDominadasPerfil: readonly string[],
  atividadesDominadasNestaSessao: readonly string[],
  atividadeConcluidaId: string,
): Atividade | null {
  const dominadas = new Set([
    ...atividadesDominadasPerfil,
    ...atividadesDominadasNestaSessao,
    atividadeConcluidaId,
  ])

  return encontrarProximaAtividadeDisponivel(trilha, dominadas)
}
