import type { Tentativa } from '../curriculo/tipos'

const CHAVE_LOCAL = 'tea:tentativas'

/**
 * Registro de tentativas plugável: hoje grava em localStorage; o Marco 3
 * substitui esta implementação por uma escrita no Firestore
 * (`perfisCrianca/{id}/tentativas`) sem mudar quem chama `registrarTentativa`.
 */
export function registrarTentativa(tentativa: Tentativa): void {
  const existentes = lerTentativas()
  existentes.push(tentativa)
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify(existentes))
}

export function lerTentativas(): Tentativa[] {
  const bruto = localStorage.getItem(CHAVE_LOCAL)
  if (!bruto) return []
  try {
    return JSON.parse(bruto) as Tentativa[]
  } catch {
    return []
  }
}
