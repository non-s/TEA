import { trilhaV1 } from './trilha-v1'

/**
 * Um módulo com pré-requisito só desbloqueia depois que TODAS as
 * atividades do módulo anterior foram dominadas — reflete a cadeia de
 * pré-requisitos descrita em docs/PEDAGOGIA.md (cada módulo depende da
 * habilidade ensinada no anterior).
 */
export function moduloDesbloqueado(
  preRequisitoModuloId: string | undefined,
  dominadas: Set<string>,
): boolean {
  if (!preRequisitoModuloId) return true
  const preRequisito = trilhaV1.modulos.find(
    (m) => m.id === preRequisitoModuloId,
  )
  if (!preRequisito) return true
  return preRequisito.atividades.every((a) => dominadas.has(a.id))
}
