import type { Atividade, Tentativa, Trilha } from './tipos'

export const INTERVALO_REVISAO_PADRAO_MS = 3 * 24 * 60 * 60 * 1000

export interface RevisaoEspacada {
  atividade: Atividade
  ultimaPraticaMs: number | null
  diasDesdeUltimaPratica: number | null
}

/**
 * Um módulo com pré-requisito só desbloqueia depois que TODAS as
 * atividades do módulo anterior foram dominadas — reflete a cadeia de
 * pré-requisitos descrita em docs/PEDAGOGIA.md (cada módulo depende da
 * habilidade ensinada no anterior).
 */
export function moduloDesbloqueado(
  _preRequisitoModuloId: string | undefined,
  _dominadas: Set<string>,
): boolean {
  // A pedido do usuário, todos os módulos estão desbloqueados
  return true
}

export function encontrarProximaAtividadeDisponivel(
  trilha: Trilha,
  dominadas: Set<string>,
): Atividade | null {
  for (const modulo of trilha.modulos) {
    if (!moduloDesbloqueado(modulo.preRequisitoModuloId, dominadas)) continue
    const atividade = modulo.atividades.find((a) => !dominadas.has(a.id))
    if (atividade) return atividade
  }
  return null
}

function ultimaTentativaDaAtividade(
  atividadeId: string,
  tentativas: Tentativa[],
): Tentativa | null {
  return tentativas
    .filter((tentativa) => tentativa.atividadeId === atividadeId)
    .reduce<Tentativa | null>((ultima, tentativa) => {
      if (!ultima || tentativa.timestamp > ultima.timestamp) return tentativa
      return ultima
    }, null)
}

export function encontrarAtividadeParaRevisao(
  trilha: Trilha,
  dominadas: Set<string>,
  tentativas: Tentativa[],
  agoraMs = Date.now(),
  intervaloRevisaoMs = INTERVALO_REVISAO_PADRAO_MS,
): RevisaoEspacada | null {
  const atividadesDominadas = trilha.modulos.flatMap((modulo) =>
    modulo.atividades.filter((atividade) => dominadas.has(atividade.id)),
  )

  const candidatas = atividadesDominadas
    .map((atividade) => {
      const ultimaTentativa = ultimaTentativaDaAtividade(
        atividade.id,
        tentativas,
      )
      const ultimaPraticaMs = ultimaTentativa?.timestamp ?? null
      const diasDesdeUltimaPratica =
        ultimaPraticaMs === null
          ? null
          : Math.floor((agoraMs - ultimaPraticaMs) / (24 * 60 * 60 * 1000))

      return {
        atividade,
        ultimaPraticaMs,
        diasDesdeUltimaPratica,
      }
    })
    .filter(
      (revisao) =>
        revisao.ultimaPraticaMs === null ||
        agoraMs - revisao.ultimaPraticaMs >= intervaloRevisaoMs,
    )

  return (
    candidatas.sort(
      (a, b) => (a.ultimaPraticaMs ?? 0) - (b.ultimaPraticaMs ?? 0),
    )[0] ?? null
  )
}
