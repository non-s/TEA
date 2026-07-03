interface ClassesAlvoToqueOpcoes {
  animacoes?: boolean
  destacado?: boolean
  className?: string
}

const movimentoCalmo =
  'transition-transform motion-reduce:transition-none hover:scale-[1.02] active:scale-[0.99]'

export function classesAlvoToque({
  animacoes = true,
  destacado = false,
  className = '',
}: ClassesAlvoToqueOpcoes = {}) {
  return [
    'flex min-h-[var(--min-alvo-atividade)] min-w-[var(--min-alvo-atividade)] items-center justify-center rounded-2xl border-2 bg-[var(--cor-fundo-alt)] text-[var(--cor-texto)] shadow-[var(--sombra-cartao)]',
    animacoes ? movimentoCalmo : 'motion-reduce:transition-none',
    destacado
      ? 'border-[var(--cor-primaria)] ring-2 ring-[var(--cor-primaria)]/25'
      : 'border-[var(--cor-borda)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

export function classesFeedbackResposta() {
  return 'min-h-10 text-lg font-medium'
}

export function classesFeedbackCorreto() {
  return 'rounded-full bg-[var(--cor-sucesso-clara)] px-4 py-1.5 text-[var(--cor-sucesso)]'
}

export function classesFeedbackTentativa() {
  return 'rounded-full bg-[var(--cor-fundo)] px-4 py-1.5 text-[var(--cor-texto-suave)]'
}
