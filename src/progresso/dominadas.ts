const CHAVE_LOCAL = 'tea:atividades-dominadas'

/**
 * Assim como em src/progresso/tentativas.ts, esta é uma implementação
 * temporária em localStorage — o Marco 3 substitui por leitura/escrita em
 * `perfisCrianca/{id}.progressoResumo` no Firestore.
 */
export function lerAtividadesDominadas(): Set<string> {
  const bruto = localStorage.getItem(CHAVE_LOCAL)
  if (!bruto) return new Set()
  try {
    return new Set(JSON.parse(bruto) as string[])
  } catch {
    return new Set()
  }
}

export function marcarAtividadeDominada(atividadeId: string): void {
  const dominadas = lerAtividadesDominadas()
  dominadas.add(atividadeId)
  localStorage.setItem(CHAVE_LOCAL, JSON.stringify([...dominadas]))
}
